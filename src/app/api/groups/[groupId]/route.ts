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

// GET /api/groups/[groupId] - Buscar detalhes de um grupo específico
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

    // Verificar se o usuário é membro do grupo
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: user.userId,
        OR: [
          { status: 'ACCEPTED' },
          { role: 'OWNER' }
        ],
      },
      include: {
        household: {
          include: {
            members: {
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
            },
            lists: {
              include: {
                items: {
                  include: {
                    property: {
                      select: {
                        id: true,
                        title: true,
                        price: true,
                        m2: true,
                        score: true,
                        photos: true,
                        condo: true,
                        iptu: true,
                        rooms: true,
                        parking: true,
                        neigh: true,
                        city: true,
                        state: true,
                        zipCode: true,
                        scoreReasons: true,
                        sourceUrl: true,
                        status: true,
                        createdAt: true,
                        createdBy: {
                          select: {
                            name: true,
                            phoneE164: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Grupo não encontrado ou você não é membro' },
        { status: 404 }
      );
    }

    const group = {
      id: membership.household.id,
      name: membership.household.name,
      role: membership.role,
      members: membership.household.members.map(member => ({
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
      })),
      lists: membership.household.lists.map(list => ({
        id: list.id,
        name: list.name,
        isDefault: list.isDefault,
        itemCount: list.items.length,
        items: list.items.map(item => ({
          id: item.property.id,
          title: item.property.title,
          price: item.property.price,
          m2: item.property.m2,
          score: item.property.score,
          photos: item.property.photos,
          condo: item.property.condo,
          iptu: item.property.iptu,
          rooms: item.property.rooms,
          parking: item.property.parking,
          neigh: item.property.neigh,
          city: item.property.city,
          state: item.property.state,
          zipCode: item.property.zipCode,
          scoreReasons: item.property.scoreReasons,
          sourceUrl: item.property.sourceUrl,
          status: item.property.status,
          createdAt: item.property.createdAt,
          createdBy: item.property.createdBy,
          addedAt: item.createdAt,
        }))
      })),
      createdAt: membership.household.createdAt,
    };

    return NextResponse.json({
      success: true,
      group,
    });

  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/groups/[groupId] - Atualizar informações do grupo
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
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nome do grupo é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é owner do grupo
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: user.userId,
        role: 'OWNER',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Apenas o proprietário pode editar o grupo' },
        { status: 403 }
      );
    }

    // Atualizar nome do grupo
    const updatedHousehold = await prisma.household.update({
      where: { id: groupId },
      data: { name },
    });

    return NextResponse.json({
      success: true,
      message: 'Grupo atualizado com sucesso',
      group: {
        id: updatedHousehold.id,
        name: updatedHousehold.name,
      },
    });

  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[groupId] - Deletar grupo
export async function DELETE(
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

    // Verificar se o usuário é owner do grupo
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: user.userId,
        role: 'OWNER',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Apenas o proprietário pode deletar o grupo' },
        { status: 403 }
      );
    }

    // Deletar grupo (isso também deletará membros e listas devido às constraints do banco)
    await prisma.household.delete({
      where: { id: groupId },
    });

    return NextResponse.json({
      success: true,
      message: 'Grupo deletado com sucesso',
    });

  } catch (error) {
    console.error('Erro ao deletar grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
