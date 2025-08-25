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
    } catch (error) {
      return NextResponse.json({ error: 'Cookie inválido' }, { status: 400 });
    }

    // Buscar usuário completo com relacionamentos
    const user = await prisma.user.findFirst({
      where: { id: authData.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneE164: true,
        city: true,
        verified: true,
        role: true,
        supabaseId: true,
        createdAt: true,
        updatedAt: true,
        properties: {
          select: {
            id: true,
            title: true,
            sourceUrl: true,
            price: true,
            m2: true,
            city: true,
            neigh: true,
            score: true,
            createdAt: true
          }
        },
        lists: {
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        },
        memberships: {
          include: {
            household: {
              select: {
                id: true,
                name: true,
                createdAt: true
              }
            }
          }
        },
        preferences: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }


    return NextResponse.json({ user });
  } catch (error) {
    console.error('💥 API /me: Erro ao buscar usuário:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Obter dados do usuário do cookie de autenticação
    const authCookie = request.cookies.get('amora_auth')?.value;
    
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    let authData: { userId: string; role: string };
    try {
      authData = JSON.parse(authCookie);
    } catch (error) {
      return NextResponse.json({ error: 'Cookie inválido' }, { status: 400 });
    }

    // Obter dados para atualização
    const body = await request.json();
    const { name, phoneE164, city } = body;

    // Validar dados
    if (name && typeof name !== 'string') {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
    }

    if (phoneE164 && typeof phoneE164 !== 'string') {
      return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 });
    }

    if (city && typeof city !== 'string') {
      return NextResponse.json({ error: 'Cidade inválida' }, { status: 400 });
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: authData.userId },
      data: {
        ...(name && { name }),
        ...(phoneE164 && { phoneE164 }),
        ...(city && { city }),
        updatedAt: new Date()
      }
    });


    return NextResponse.json({ 
      message: 'Usuário atualizado com sucesso',
      user: updatedUser 
    });
  } catch (error) {
    console.error('💥 API /me PATCH: Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
