import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PropertyService } from '../../../services/property';

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

// GET /api/properties - Listar propriedades do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar propriedades do usuário
    const properties = await prisma.property.findMany({
      where: {
        createdByUserId: user.userId,
        status: 'ACTIVE',
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
      },
    });

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
        lastParsedAt: property.lastParsedAt,
        createdAt: property.createdAt,
        createdBy: property.createdBy,
      })),
    });

  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Criar nova propriedade
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
    const { sourceUrl } = body;

    if (!sourceUrl) {
      return NextResponse.json(
        { error: 'URL do imóvel é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma propriedade com esta URL para este usuário
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
        createdByUserId: user.userId,
        status: 'PENDING',
        title: 'Analisando imóvel...',
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

    // Iniciar parsing em background
    PropertyService.processProperty(property.id).catch(error => {
      console.error('Erro no parsing em background:', error);
    });

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
        lastParsedAt: property.lastParsedAt,
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
