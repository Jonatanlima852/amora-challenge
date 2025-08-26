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

// GET /api/contacts/invites - Listar convites recebidos pelo usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar convites pendentes recebidos pelo usuário
    const pendingInvites = await prisma.brokerContact.findMany({
      where: {
        userId: user.userId,
        status: 'PENDING'
      },
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            company: true,
            bio: true,
            slug: true
          }
        }
      },
      orderBy: {
        invitedAt: 'desc'
      }
    });

    // Buscar convites aceitos
    const acceptedInvites = await prisma.brokerContact.findMany({
      where: {
        userId: user.userId,
        status: 'ACCEPTED'
      },
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            company: true,
            bio: true,
            slug: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      pendingInvites: pendingInvites.map(invite => ({
        id: invite.id,
        brokerId: invite.broker.id,
        brokerName: invite.broker.name,
        brokerEmail: invite.broker.email,
        brokerAvatar: invite.broker.avatar,
        brokerCompany: invite.broker.company,
        brokerBio: invite.broker.bio,
        brokerSlug: invite.broker.slug,
        notes: invite.notes,
        invitedAt: invite.invitedAt
      })),
      acceptedInvites: acceptedInvites.map(invite => ({
        id: invite.id,
        brokerId: invite.broker.id,
        brokerName: invite.broker.name,
        brokerEmail: invite.broker.email,
        brokerAvatar: invite.broker.avatar,
        brokerCompany: invite.broker.company,
        brokerBio: invite.broker.bio,
        brokerSlug: invite.broker.slug,
        notes: invite.notes,
        invitedAt: invite.invitedAt,
        respondedAt: invite.respondedAt
      })),
      stats: {
        pending: pendingInvites.length,
        accepted: acceptedInvites.length,
        total: pendingInvites.length + acceptedInvites.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar convites do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/contacts/invites - Responder a um convite (aceitar/recusar)
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
    const { inviteId, action } = body;

    if (!inviteId || !action) {
      return NextResponse.json(
        { error: 'ID do convite e ação são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação deve ser "accept" ou "decline"' },
        { status: 400 }
      );
    }

    // Verificar se o convite pertence ao usuário
    const invite = await prisma.brokerContact.findFirst({
      where: {
        id: inviteId,
        userId: user.userId,
        status: 'PENDING'
      }
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Convite não encontrado ou já respondido' },
        { status: 404 }
      );
    }

    // Atualizar status do convite
    const updatedInvite = await prisma.brokerContact.update({
      where: { id: inviteId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
        respondedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: action === 'accept' ? 'Convite aceito com sucesso' : 'Convite recusado',
      invite: updatedInvite
    });

  } catch (error) {
    console.error('Erro ao responder convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
