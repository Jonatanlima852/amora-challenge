import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Função auxiliar para obter usuário autenticado
async function getAuthenticatedUser(request: NextRequest) {
  const authCookie = request.cookies.get('amora_auth')?.value;
  if (!authCookie) {
    return null;
  }

  try {
    const auth = JSON.parse(authCookie);
    return auth;
  } catch {
    return null;
  }
}

// GET /api/groups/[groupId]/members - Listar membros e convites
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Aguardar os params
    const { groupId } = await params;

    // Verificar se o usuário é membro do grupo (ACCEPTED ou OWNER)
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: user.userId,
        OR: [
          { status: 'ACCEPTED' },
          { role: 'OWNER' }
        ],
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Você não é membro deste grupo' },
        { status: 403 }
      );
    }

    // Buscar todos os membros e convites
    const members = await prisma.householdMember.findMany({
      where: { householdId: groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDING primeiro
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      members: members.map(member => ({
        id: member.id,
        userId: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.user.role,
        membershipRole: member.role,
        status: member.status,
        invitedBy: member.invitedBy,
        invitedAt: member.invitedAt,
        respondedAt: member.respondedAt,
        createdAt: member.createdAt,
      })),
    });

  } catch (error) {
    console.error('Erro ao buscar membros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[groupId]/members - Convidar membro
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Aguardar os params
    const { groupId } = await params;
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é owner do grupo
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: user.userId,
        role: 'OWNER',
        status: 'ACCEPTED', // Owner deve ter status ACCEPTED
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Apenas o proprietário pode convidar membros' },
        { status: 403 }
      );
    }

    // Buscar usuário pelo email
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já é membro ou tem convite pendente
    const existingMembership = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: invitedUser.id,
      },
    });

    if (existingMembership) {
      if (existingMembership.status === 'PENDING') {
        return NextResponse.json(
          { error: 'Usuário já tem um convite pendente' },
          { status: 409 }
        );
      } else if (existingMembership.status === 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Usuário já é membro deste grupo' },
          { status: 409 }
        );
      }
    }

    // Criar convite
    const newMembership = await prisma.householdMember.create({
      data: {
        householdId: groupId,
        userId: invitedUser.id,
        role: 'MEMBER',
        status: 'PENDING',
        invitedBy: user.userId,
        invitedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Convite enviado com sucesso',
      member: {
        id: newMembership.id,
        userId: newMembership.user.id,
        name: newMembership.user.name,
        email: newMembership.user.email,
        role: newMembership.user.role,
        membershipRole: newMembership.role,
        status: newMembership.status,
        invitedBy: newMembership.invitedBy,
        invitedAt: newMembership.invitedAt,
        createdAt: newMembership.createdAt,
      },
    });

  } catch (error) {
    console.error('Erro ao convidar membro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/groups/[groupId]/members - Responder ao convite
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Aguardar os params
    const { groupId } = await params;
    const body = await request.json();
    const { action, memberId } = body; // 'accept' ou 'decline' + memberId

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida' },
        { status: 400 }
      );
    }

    if (!memberId) {
      return NextResponse.json(
        { error: 'ID do membro é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é o convidado
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: user.userId,
        id: memberId,
        status: 'PENDING',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Convite não encontrado ou já respondido' },
        { status: 404 }
      );
    }

    // Atualizar status do convite
    const updatedMembership = await prisma.householdMember.update({
      where: { id: memberId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
        respondedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: action === 'accept' ? 'Convite aceito com sucesso' : 'Convite recusado',
      member: {
        id: updatedMembership.id,
        status: updatedMembership.status,
        respondedAt: updatedMembership.respondedAt,
      },
    });

  } catch (error) {
    console.error('Erro ao responder convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[groupId]/members/[memberId] - Remover membro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; memberId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Aguardar os params
    const { groupId, memberId } = await params;

    // Verificar se o usuário é owner do grupo
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: user.userId,
        role: 'OWNER',
        status: 'ACCEPTED', // Owner deve ter status ACCEPTED
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Apenas o proprietário pode remover membros' },
        { status: 403 }
      );
    }

    // Buscar membro a ser removido
    const memberToRemove = await prisma.householdMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToRemove) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      );
    }

    // Não permitir remover o próprio owner
    if (memberToRemove.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Não é possível remover o proprietário do grupo' },
        { status: 400 }
      );
    }

    // Remover membro
    await prisma.householdMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
      message: 'Membro removido com sucesso',
    });

  } catch (error) {
    console.error('Erro ao remover membro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
