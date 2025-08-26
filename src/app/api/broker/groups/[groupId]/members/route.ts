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

// PUT /api/broker/groups/[groupId]/members - Responder a convite ou gerenciar membros
export async function PUT(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é corretor
    if (user.userRole !== 'BROKER' && user.userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado - apenas corretores' },
        { status: 403 }
      );
    }

    const { groupId } = params;
    const body = await request.json();
    const { action, memberId } = body;

    if (!action || !memberId) {
      return NextResponse.json(
        { error: 'Ação e ID do membro são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação deve ser "accept" ou "decline"' },
        { status: 400 }
      );
    }

    // Verificar se o corretor é membro do grupo
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: user.userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Você não é membro deste grupo' },
        { status: 403 }
      );
    }



    // Atualizar status do membro
    const updatedMember = await prisma.householdMember.update({
      where: { id: memberId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
        respondedAt: action === 'accept' || action === 'decline' ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: action === 'accept' ? 'Convite aceito com sucesso' : 'Convite recusado',
      member: updatedMember,
    });

  } catch (error) {
    console.error('Erro ao gerenciar membro do grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/broker/groups/[groupId]/members - Convidar novo membro
export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é corretor
    if (user.userRole !== 'BROKER' && user.userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado - apenas corretores' },
        { status: 403 }
      );
    }

    const { groupId } = params;
    const body = await request.json();
    const { email, role = 'MEMBER' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o corretor é owner do grupo
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: user.userId,
        role: 'OWNER',
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
      where: { email: email.toLowerCase() },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já é membro
    const existingMember = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: invitedUser.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Usuário já é membro deste grupo' },
        { status: 400 }
      );
    }

    // Adicionar membro ao grupo
    const newMember = await prisma.householdMember.create({
      data: {
        householdId: groupId,
        userId: invitedUser.id,
        role: role,
        status: 'PENDING',
        invitedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phoneE164: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Convite enviado com sucesso',
      member: {
        id: newMember.id,
        userId: newMember.user.id,
        name: newMember.user.name,
        email: newMember.user.email,
        role: newMember.user.role,
        membershipRole: newMember.role,
        status: newMember.status,
        invitedAt: newMember.invitedAt,
        phoneE164: newMember.user.phoneE164,
        avatar: newMember.user.avatar,
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
