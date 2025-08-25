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

// GET /api/groups - Listar grupos do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar grupos onde o usuário é membro
    const memberships = await prisma.householdMember.findMany({
      where: {
        userId: user.userId,
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

    const groups = memberships.map(membership => ({
      id: membership.household.id,
      name: membership.household.name,
      role: membership.role,
      status: membership.status,
      invitedAt: membership.invitedAt,
      members: membership.household.members.map(member => ({
        id: member.id,
        userId: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.user.role,
        membershipRole: member.role,
        status: member.status,
        invitedAt: member.invitedAt,
      })),
      properties: membership.household.lists.flatMap(list => 
        list.items.map(item => ({
          id: item.property.id,
          title: item.property.title,
          price: item.property.price,
          m2: item.property.m2,
          score: item.property.score,
          photos: item.property.photos,
          notes: item.notes,
          favorite: item.favorite,
        }))
      ),
      createdAt: membership.household.createdAt,
    }));

    return NextResponse.json({
      success: true,
      groups,
    });

  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Criar novo grupo
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nome do grupo é obrigatório' },
        { status: 400 }
      );
    }

    // Criar grupo e adicionar usuário como owner com status ACCEPTED
    const household = await prisma.household.create({
      data: {
        name,
        members: {
          create: {
            userId: user.userId,
            role: 'OWNER',
            status: 'ACCEPTED', // Status ativo para o criador
            invitedAt: new Date(), // Marcar como convidado agora
            respondedAt: new Date(), // Marcar como respondido agora
          },
        },
      },
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
      },
    });

    return NextResponse.json({
      success: true,
      group: {
        id: household.id,
        name: household.name,
        role: 'OWNER',
        status: 'ACCEPTED',
        invitedAt: new Date(),
        members: household.members.map(member => ({
          id: member.id,
          userId: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.user.role,
          membershipRole: member.role,
          status: member.status,
          invitedAt: member.invitedAt,
        })),
        properties: [],
        createdAt: household.createdAt,
      },
    });

  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
