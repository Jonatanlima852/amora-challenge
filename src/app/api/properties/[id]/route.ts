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

// GET /api/properties/[id] - Buscar propriedade específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Buscar propriedade do usuário
    const property = await prisma.property.findFirst({
      where: {
        id,
        createdByUserId: user.userId,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            phoneE164: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Propriedade não encontrada' },
        { status: 404 }
      );
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
        photos: property.photos,
        score: property.score,
        scoreReasons: property.scoreReasons,
        sourceUrl: property.sourceUrl,
        status: property.status,
        description: property.description,
        amenities: property.amenities,
        contactInfo: property.contactInfo,
        lastParsedAt: property.lastParsedAt,
        createdAt: property.createdAt,
        createdBy: property.createdBy,
        comments: property.comments,
      },
    });

  } catch (error) {
    console.error('Erro ao buscar propriedade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id] - Atualizar propriedade
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Verificar se a propriedade pertence ao usuário
    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        createdByUserId: user.userId,
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Propriedade não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar propriedade
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        // Outros campos que podem ser editados
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

    return NextResponse.json({
      success: true,
      property: updatedProperty,
    });

  } catch (error) {
    console.error('Erro ao atualizar propriedade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Deletar propriedade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Verificar se a propriedade pertence ao usuário
    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        createdByUserId: user.userId,
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Propriedade não encontrada' },
        { status: 404 }
      );
    }

    // Deletar propriedade (soft delete - mudar status para INACTIVE)
    await prisma.property.update({
      where: { id },
      data: {
        status: 'INACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Propriedade removida com sucesso',
    });

  } catch (error) {
    console.error('Erro ao deletar propriedade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
