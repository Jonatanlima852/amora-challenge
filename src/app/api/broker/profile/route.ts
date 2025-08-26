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

// PUT /api/broker/profile - Atualizar perfil do corretor
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      bio,
      slug,
      company,
      specialties,
      socialLinks
    } = body;

    // Verificar se o usuário é corretor
    const isBroker = await verifyBroker(user.userId);
    if (!isBroker) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas corretores podem acessar esta rota.' },
        { status: 403 }
      );
    }

    // Buscar usuário pelo ID da sessão
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (user.role !== 'BROKER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Verificar se o slug já existe (se for diferente do atual)
    if (slug) {
      const existingUser = await prisma.user.findFirst({
        where: {
          slug: slug,
          id: { not: dbUser.id }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'URL personalizada já está em uso' },
          { status: 400 }
        );
      }
    }

    // Atualizar perfil
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        name: name || undefined,
        bio: bio || undefined,
        slug: slug || undefined,
        company: company || undefined,
        specialties: specialties || undefined,
        socialLinks: socialLinks || undefined,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        slug: true,
        company: true,
        specialties: true,
        socialLinks: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      profile: updatedUser
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil do corretor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET /api/broker/profile - Buscar perfil atual do corretor
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

    // Buscar usuário pelo ID da sessão
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneE164: true,
        bio: true,
        slug: true,
        avatar: true,
        company: true,
        specialties: true,
        socialLinks: true,
        city: true,
        role: true
      }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...dbUser,
        phone: dbUser.phoneE164 || null
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil do corretor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
