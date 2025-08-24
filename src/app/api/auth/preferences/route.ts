import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Obter dados do usuário do cookie de autenticação
    const authCookie = request.cookies.get('amora_auth')?.value;
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    let authData: { userId: string; role: string };
    try {
      authData = JSON.parse(authCookie);
    } catch {
      return NextResponse.json({ error: 'Cookie inválido' }, { status: 400 });
    }

    // Buscar preferências do usuário
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: authData.userId }
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obter dados do usuário do cookie de autenticação
    const authCookie = request.cookies.get('amora_auth')?.value;
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    let authData: { userId: string; role: string };
    try {
      authData = JSON.parse(authCookie);
    } catch {
      return NextResponse.json({ error: 'Cookie inválido' }, { status: 400 });
    }

    // Obter dados das preferências
    const body = await request.json();
    const { 
      minPrice, 
      maxPrice, 
      minArea, 
      maxArea, 
      neighborhoods, 
      propertyTypes, 
      minParking, 
      notifications 
    } = body;

    // Criar ou atualizar preferências
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: authData.userId },
      update: {
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        neighborhoods,
        propertyTypes,
        minParking,
        notifications,
        updatedAt: new Date()
      },
      create: {
        userId: authData.userId,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        neighborhoods,
        propertyTypes,
        minParking,
        notifications
      }
    });

    return NextResponse.json({ 
      message: 'Preferências salvas com sucesso',
      preferences 
    });
  } catch (error) {
    console.error('Erro ao salvar preferências:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
