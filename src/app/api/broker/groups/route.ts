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

// Função auxiliar para verificar se o usuário é corretor
async function verifyBroker(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  
  return user?.role === 'BROKER' || user?.role === 'ADMIN';
}

// GET /api/broker/groups - Listar grupos do corretor
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é corretor
    const isBroker = await verifyBroker(user.userId);
    if (!isBroker) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas corretores podem acessar esta rota.' },
        { status: 403 }
      );
    }

    // Buscar grupos onde o corretor é o broker
    const groups = await prisma.list.findMany({
      where: {
        brokerId: user.userId,
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
                    phoneE164: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
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
                status: true,
              },
            },
            addedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular estatísticas
    const totalGroups = groups.length;
    const activeGroups = groups.filter(g => g.household && g.household.members.length > 0).length;
    const totalProperties = groups.reduce((sum, group) => sum + group.items.length, 0);
    const totalMembers = groups.reduce((sum, group) => 
      sum + (group.household ? group.household.members.length : 0), 0
    );

    return NextResponse.json({
      success: true,
      groups: groups.map(group => ({
        id: group.id,
        name: group.name,
        household: group.household ? {
          id: group.household.id,
          name: group.household.name,
          members: group.household.members.map(member => ({
            id: member.id,
            userId: member.user.id,
            name: member.user.name,
            email: member.user.email,
            phoneE164: member.user.phoneE164,
            city: member.user.city,
            role: member.role,
            status: member.status,
            invitedAt: member.invitedAt,
            respondedAt: member.respondedAt,
          })),
        } : null,
        properties: group.items.map(item => ({
          id: item.property.id,
          title: item.property.title,
          price: item.property.price,
          m2: item.property.m2,
          score: item.property.score,
          photos: item.property.photos,
          status: item.property.status,
          notes: item.notes,
          favorite: item.favorite,
          addedBy: item.addedBy ? {
            id: item.addedBy.id,
            name: item.addedBy.name,
          } : null,
        })),
        isDefault: group.isDefault,
        createdAt: group.createdAt,
      })),
      stats: {
        total: totalGroups,
        active: activeGroups,
        inactive: totalGroups - activeGroups,
        totalProperties,
        totalMembers,
      },
    });

  } catch (error) {
    console.error('Erro ao buscar grupos do corretor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/broker/groups - Criar novo grupo
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é corretor
    const isBroker = await verifyBroker(user.userId);
    if (!isBroker) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas corretores podem acessar esta rota.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, isDefault } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nome do grupo é obrigatório' },
        { status: 400 }
      );
    }

    // Criar novo grupo
    const newGroup = await prisma.list.create({
      data: {
        name,
        brokerId: user.userId,
        isDefault: isDefault || false,
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
                    phoneE164: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
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
                status: true,
              },
            },
            addedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      group: {
        id: newGroup.id,
        name: newGroup.name,
        household: newGroup.household,
        properties: newGroup.items,
        isDefault: newGroup.isDefault,
        createdAt: newGroup.createdAt,
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
