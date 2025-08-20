import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PropertyService } from '../../../services/property';

// GET /api/properties - Listar propriedades do usuário
export async function GET(request: NextRequest) {
  try {
    // TODO: Implementar autenticação real
    // Por enquanto, vamos buscar todas as propriedades ativas
    const properties = await prisma.property.findMany({
      where: {
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
    const body = await request.json();
    const { sourceUrl } = body;

    if (!sourceUrl) {
      return NextResponse.json(
        { error: 'URL do imóvel é obrigatória' },
        { status: 400 }
      );
    }

    // TODO: Implementar autenticação real
    // Por enquanto, vamos criar com um usuário mock
    const mockUserId = 'mock-user-id';
    
    // Verificar se já existe uma propriedade com esta URL
    const existingProperty = await prisma.property.findFirst({
      where: { sourceUrl },
    });

    if (existingProperty) {
      return NextResponse.json(
        { error: 'Este imóvel já foi adicionado' },
        { status: 409 }
      );
    }

    // Criar propriedade
    const property = await prisma.property.create({
      data: {
        sourceUrl,
        createdByUserId: mockUserId,
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
