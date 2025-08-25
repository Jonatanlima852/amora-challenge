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

// GET /api/groups/[groupId]/lists - Listar todas as listas do grupo
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

    // Buscar todas as listas do grupo
    const lists = await prisma.list.findMany({
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
                score: true,
                photos: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ],
    });

    return NextResponse.json({
      success: true,
      lists,
    });

  } catch (error) {
    console.error('Erro ao buscar listas do grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[groupId]/lists - Criar nova lista no grupo
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

    const { groupId } = await params;
    const body = await request.json();
    const { name, isDefault = false } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nome da lista é obrigatório' },
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

    // Se for lista padrão, desmarcar outras como padrão
    if (isDefault) {
      await prisma.list.updateMany({
        where: {
          householdId: groupId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Criar nova lista
    const list = await prisma.list.create({
      data: {
        name,
        householdId: groupId,
        isDefault,
        ownerId: user.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Lista criada com sucesso',
      list,
    });

  } catch (error) {
    console.error('Erro ao criar lista:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
