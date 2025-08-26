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

// GET /api/broker/stats - Estatísticas gerais do corretor
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

    // Buscar estatísticas em paralelo para melhor performance
    const [
      propertiesStats,
      contactsStats,
      groupsStats,
      recentActivity
    ] = await Promise.all([
      // Estatísticas de propriedades
      prisma.property.groupBy({
        by: ['status'],
        where: { createdByUserId: user.userId },
        _count: { id: true }
      }),

      // Estatísticas de contatos
      prisma.user.count({
        where: {
          OR: [
            {
              comments: {
                some: {
                  property: { createdByUserId: user.userId }
                }
              }
            },
            {
              memberships: {
                some: {
                  household: {
                    lists: { some: { brokerId: user.userId } }
                  }
                }
              }
            },
            {
              addedItems: {
                some: {
                  list: { brokerId: user.userId }
                }
              }
            }
          ],
          id: { not: user.userId }
        }
      }),

      // Estatísticas de grupos
      prisma.list.findMany({
        where: { brokerId: user.userId },
        select: {
          id: true,
          household: {
            select: {
              _count: {
                select: {
                  members: true
                }
              }
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        }
      }),

      // Atividade recente (últimas 5 propriedades criadas)
      prisma.property.findMany({
        where: { createdByUserId: user.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          price: true,
          city: true,
          neigh: true,
        }
      })
    ]);

    // Processar estatísticas de propriedades
    const propertyStatusCounts = propertiesStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    const totalProperties = Object.values(propertyStatusCounts).reduce((sum, count) => sum + count, 0);
    const activeProperties = propertyStatusCounts['ACTIVE'] || 0;
    const pendingProperties = propertyStatusCounts['PENDING'] || 0;
    const soldProperties = propertyStatusCounts['SOLD'] || 0;

    // Processar estatísticas de grupos
    const totalGroups = groupsStats.length;
    const activeGroups = groupsStats.filter(g => g.household && g.household._count.members > 0).length;
    const totalPropertiesInGroups = groupsStats.reduce((sum, g) => sum + (g._count?.items || 0), 0);
    const totalMembers = groupsStats.reduce((sum, g) => 
      sum + (g.household ? g.household._count.members : 0), 0
    );

    // Calcular taxa de conversão (simplificado - baseado em propriedades vendidas)
    const conversionRate = totalProperties > 0 ? 
      Math.round((soldProperties / totalProperties) * 100 * 10) / 10 : 0;

    // Simular visualizações mensais (baseado em propriedades ativas)
    const monthlyViews = Math.floor(activeProperties * 3.5 + Math.random() * 20);

    return NextResponse.json({
      success: true,
      stats: {
        properties: {
          total: totalProperties,
          active: activeProperties,
          pending: pendingProperties,
          sold: soldProperties,
        },
        contacts: {
          total: contactsStats,
          active: Math.floor(contactsStats * 0.7), // Simulado - 70% ativos
        },
        groups: {
          total: totalGroups,
          active: activeGroups,
          inactive: totalGroups - activeGroups,
          totalProperties: totalPropertiesInGroups,
          totalMembers,
        },
        performance: {
          conversionRate,
          monthlyViews,
        }
      },
      recentActivity: recentActivity.map(property => ({
        id: property.id,
        title: property.title,
        status: property.status,
        createdAt: property.createdAt,
        price: property.price,
        location: property.city && property.neigh ? 
          `${property.neigh}, ${property.city}` : 
          property.city || property.neigh || 'Localização não informada',
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do corretor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
