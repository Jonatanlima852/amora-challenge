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

// GET /api/properties/[id]/comments - Listar comentários da propriedade
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

    // Verificar se a propriedade pertence ao usuário
    const property = await prisma.property.findFirst({
      where: {
        id,
        createdByUserId: user.userId,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Propriedade não encontrada' },
        { status: 404 }
      );
    }

    // Buscar comentários da propriedade
    const comments = await prisma.comment.findMany({
      where: {
        propertyId: id,
      },
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
    });

    return NextResponse.json({
      success: true,
      comments: comments.map(comment => ({
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt,
        user: comment.user ? {
          name: comment.user.name,
        } : null,
        isAnonymous: comment.isAnonymous,
      })),
    });

  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/properties/[id]/comments - Adicionar comentário
export async function POST(
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
    const { text, isAnonymous = false } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Texto do comentário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a propriedade pertence ao usuário
    const property = await prisma.property.findFirst({
      where: {
        id,
        createdByUserId: user.userId,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Propriedade não encontrada' },
        { status: 404 }
      );
    }

    // Criar comentário
    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        propertyId: id,
        userId: user.userId,
        isAnonymous,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt,
        user: comment.user ? {
          name: comment.user.name,
        } : null,
        isAnonymous: comment.isAnonymous,
      },
    });

  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
