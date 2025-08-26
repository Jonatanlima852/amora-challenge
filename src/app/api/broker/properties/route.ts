import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PropertyService } from '../../../../services/property';

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

// GET /api/broker/properties - Listar propriedades do corretor
export async function GET(request: NextRequest) {
  try {
    console.log('entrou aqui1');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    console.log('entrou aqui2');

    // Verificar se o usuário é corretor
    const isBroker = await verifyBroker(user.userId);
    if (!isBroker) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas corretores podem acessar esta rota.' },
        { status: 403 }
      );
    }

    console.log('entrou aqui3');

    // Buscar propriedades do corretor
    const properties = await prisma.property.findMany({
      where: {
        createdByUserId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        createdBy: {
          select: {
            name: true,
            phoneE164: true,
          },
        },
        lists: {
          include: {
            list: {
              select: {
                id: true,
                name: true,
                household: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calcular estatísticas
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => p.status === 'ACTIVE').length;
    const pendingProperties = properties.filter(p => p.status === 'PENDING').length;
    const soldProperties = properties.filter(p => p.status === 'SOLD').length;

    return NextResponse.json({
      success: true,
      properties: properties.map(property => ({
        id: property.id,
        title: property.title,
        price: property.price,
        m2: property.m2,
        condo: property.condo,
        iptu: property.iptu,
        rooms: property.rooms,
        parking: property.parking,
        neigh: property.neigh,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        photos: property.photos,
        score: property.score,
        scoreReasons: property.scoreReasons,
        sourceUrl: property.sourceUrl,
        status: property.status,
        description: property.description,
        amenities: property.amenities,
        lastParsedAt: property.lastParsedAt,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        createdBy: property.createdBy,
        lists: property.lists.map(item => ({
          listId: item.list.id,
          listName: item.list.name,
          householdId: item.list.household?.id,
          householdName: item.list.household?.name,
        })),
      })),
      stats: {
        total: totalProperties,
        active: activeProperties,
        pending: pendingProperties,
        sold: soldProperties,
      },
    });

  } catch (error) {
    console.error('Erro ao buscar propriedades do corretor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/broker/properties - Criar nova propriedade
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
    const { sourceUrl, title, price, m2, condo, iptu, rooms, parking, neigh, city, state, zipCode, description, amenities } = body;

    if (!sourceUrl) {
      return NextResponse.json(
        { error: 'URL do imóvel é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma propriedade com esta URL para este corretor
    const existingProperty = await prisma.property.findFirst({
      where: {
        sourceUrl,
        createdByUserId: user.userId,
      },
    });

    if (existingProperty) {
      return NextResponse.json(
        { error: 'Este imóvel já foi adicionado por você' },
        { status: 409 }
      );
    }

    // Criar propriedade
    const property = await prisma.property.create({
      data: {
        sourceUrl,
        title: title || 'Analisando imóvel...',
        price: price ? parseInt(price) : null,
        m2: m2 ? parseInt(m2) : null,
        condo: condo ? parseInt(condo) : null,
        iptu: iptu ? parseInt(iptu) : null,
        rooms: rooms ? parseInt(rooms) : null,
        parking: parking ? parseInt(parking) : null,
        neigh: neigh || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        description: description || null,
        amenities: amenities || null,
        createdByUserId: user.userId,
        status: title ? 'ACTIVE' : 'PENDING',
        parseAttempts: 0,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            phoneE164: true,
          },
        },
      },
    });

    // Se não foi fornecido título, iniciar parsing em background
    if (!title) {
      PropertyService.processProperty(property.id).catch(error => {
        console.error('Erro no parsing em background:', error);
      });
    }

    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        title: property.title,
        price: property.price,
        m2: property.m2,
        condo: property.condo,
        iptu: property.iptu,
        rooms: property.rooms,
        parking: property.parking,
        neigh: property.neigh,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        description: property.description,
        amenities: property.amenities,
        sourceUrl: property.sourceUrl,
        status: property.status,
        createdAt: property.createdAt,
        createdBy: property.createdBy,
      },
    });

  } catch (error) {
    console.error('Erro ao criar propriedade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
