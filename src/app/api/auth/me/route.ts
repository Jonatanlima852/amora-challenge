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

    // Buscar usuário completo com relacionamentos
    const user = await prisma.user.findFirst({
      where: { id: authData.userId },
      include: {
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
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
