import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json();
    
    if (!user || !user.id || !user.email) {
      return NextResponse.json({ error: 'Dados do usuário são obrigatórios' }, { status: 400 });
    }

    // Validação básica dos dados recebidos
    if (typeof user.id !== 'string' || typeof user.email !== 'string') {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Buscar usuário no Prisma por supabaseId OU email
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: user.id },
          { email: user.email }
        ]
      },
      select: { id: true, name: true, email: true, role: true, phoneE164: true, verified: true, supabaseId: true }
    });

    // Se não existir, criar automaticamente
    if (!dbUser) {
      
      dbUser = await prisma.user.create({
        data: {
          supabaseId: user.id,
          email: user.email,
          name: user.user_metadata?.name || null,
          phoneE164: user.user_metadata?.phone || null,
          role: 'USER',
          verified: false
        },
        select: { id: true, name: true, email: true, role: true, phoneE164: true, verified: true, supabaseId: true }
      });
      
    } else if (!dbUser.supabaseId) {
      // Se existir mas não tiver supabaseId, atualizar
      
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { supabaseId: user.id }
      });
    }

    // Criar cookie seguro com dados do usuário
    const authData = {
      userId: dbUser.id,
      role: dbUser.role,
      email: dbUser.email,
      name: dbUser.name,
      phoneE164: dbUser.phoneE164,
      verified: dbUser.verified
    };


    const response = NextResponse.json({ 
      success: true, 
      user: authData 
    });

    // Setar cookie httpOnly e seguro
    response.cookies.set('amora_auth', JSON.stringify(authData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/'
    });


    return response;

  } catch (error) {
    console.error('Erro na rota de sessão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    
    const response = NextResponse.json({ success: true });
    
    // Limpar cookie de autenticação de forma mais agressiva
    response.cookies.set('amora_auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      path: '/'
    });

    // Também limpar com path específico
    response.cookies.set('amora_auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      path: '/app'
    });

    return response;
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
