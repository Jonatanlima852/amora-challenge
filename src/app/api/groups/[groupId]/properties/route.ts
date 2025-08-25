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

// POST /api/groups/[groupId]/properties - Adicionar propriedade ao grupo
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
    const { propertyUrl, notes, listId } = body;

    if (!propertyUrl) {
      return NextResponse.json(
        { error: 'URL do imóvel é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é membro do grupo
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId: groupId,
        userId: user.userId,
        status: 'ACCEPTED',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Você não é membro deste grupo' },
        { status: 403 }
      );
    }

    // Verificar se já existe uma propriedade com esta URL
    let property = await prisma.property.findFirst({
      where: {
        sourceUrl: propertyUrl,
        status: { not: 'INACTIVE' },
      },
    });

    if (!property) {
      // Criar nova propriedade com scraping
      property = await prisma.property.create({
        data: {
          sourceUrl: propertyUrl,
          createdByUserId: user.userId,
          status: 'PENDING',
          title: 'Analisando imóvel...',
          parseAttempts: 0,
        },
      });

      // Iniciar parsing em background
      const { PropertyService } = await import('@/services/property');
      PropertyService.processProperty(property.id).catch(error => {
        console.error('Erro no parsing em background:', error);
      });
    }

    // Se listId foi fornecido, usar essa lista, senão usar a lista padrão
    let list;
    
    if (listId) {
      // Verificar se a lista existe e pertence ao grupo
      list = await prisma.list.findFirst({
        where: {
          id: listId,
          householdId: groupId,
        },
      });
      
      if (!list) {
        return NextResponse.json(
          { error: 'Lista não encontrada' },
          { status: 404 }
        );
      }
    } else {
      // Buscar lista padrão ou criar uma
      list = await prisma.list.findFirst({
        where: {
          householdId: groupId,
          isDefault: true,
        },
      });

      if (!list) {
        list = await prisma.list.create({
          data: {
            name: 'Imóveis do Grupo',
            householdId: groupId,
            isDefault: true,
          },
        });
      }
    }

    // Verificar se a propriedade já está na lista
    const existingItem = await prisma.listItem.findFirst({
      where: {
        listId: list.id,
        propertyId: property.id,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Este imóvel já está no grupo' },
        { status: 409 }
      );
    }

    // Adicionar propriedade à lista
    const listItem = await prisma.listItem.create({
      data: {
        listId: list.id,
        propertyId: property.id,
        notes: notes || null,
        addedById: user.userId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            m2: true,
            score: true,
            photos: true,
            sourceUrl: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Imóvel adicionado ao grupo com sucesso',
      item: {
        id: listItem.id,
        property: listItem.property,
        notes: listItem.notes,
        addedAt: listItem.createdAt,
        addedBy: user.userId,
      },
    });

  } catch (error) {
    console.error('Erro ao adicionar imóvel ao grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET /api/groups/[groupId]/properties - Listar propriedades do grupo
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
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Você não é membro deste grupo' },
        { status: 403 }
      );
    }

    // Buscar propriedades do grupo
    const list = await prisma.list.findFirst({
      where: {
        householdId: groupId,
      },
      include: {
        items: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                price: true,
                m2: true,
                condo: true,
                iptu: true,
                rooms: true,
                parking: true,
                neigh: true,
                city: true,
                state: true,
                zipCode: true,
                photos: true,
                score: true,
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!list) {
      return NextResponse.json({
        success: true,
        properties: [],
      });
    }

    const properties = list.items.map(item => ({
      id: item.property.id,
      title: item.property.title,
      price: item.property.price,
      m2: item.property.m2,
      condo: item.property.condo,
      iptu: item.property.iptu,
      rooms: item.property.rooms,
      parking: item.property.parking,
      neigh: item.property.neigh,
      city: item.property.city,
      state: item.property.state,
      zipCode: item.property.zipCode,
      photos: item.property.photos,
      score: item.property.score,
      scoreReasons: item.property.scoreReasons,
      sourceUrl: item.property.sourceUrl,
      status: item.property.status,
      createdAt: item.property.createdAt,
      createdBy: item.property.createdBy,
      notes: item.notes,
      favorite: item.favorite,
      addedAt: item.createdAt,
    }));

    return NextResponse.json({
      success: true,
      properties,
    });

  } catch (error) {
    console.error('Erro ao buscar propriedades do grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
