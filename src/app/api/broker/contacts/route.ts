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

// GET /api/broker/contacts - Listar contatos do corretor
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

    // Buscar contatos do corretor
    const contacts = await prisma.brokerContact.findMany({
      where: {
        brokerId: user.userId,
        status: 'ACCEPTED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneE164: true,
            city: true,
            createdAt: true,
            avatar: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Buscar convites pendentes
    const pendingInvites = await prisma.brokerContact.findMany({
      where: {
        brokerId: user.userId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneE164: true,
            city: true,
            createdAt: true,
            avatar: true
          }
        }
      },
      orderBy: {
        invitedAt: 'desc'
      }
    });

    // Calcular estatísticas
    const totalContacts = contacts.length;
    const totalPending = pendingInvites.length;

    return NextResponse.json({
      success: true,
      contacts: contacts.map(contact => ({
        id: contact.id,
        userId: contact.user.id,
        name: contact.user.name,
        email: contact.user.email,
        phoneE164: contact.user.phoneE164,
        city: contact.user.city,
        createdAt: contact.user.createdAt,
        avatar: contact.user.avatar,
        notes: contact.notes,
        invitedAt: contact.invitedAt,
        respondedAt: contact.respondedAt
      })),
      pendingInvites: pendingInvites.map(invite => ({
        id: invite.id,
        userId: invite.user.id,
        name: invite.user.name,
        email: invite.user.email,
        phoneE164: invite.user.phoneE164,
        city: invite.user.city,
        createdAt: invite.user.createdAt,
        avatar: invite.user.avatar,
        notes: invite.notes,
        invitedAt: invite.invitedAt
      })),
      stats: {
        total: totalContacts,
        pending: totalPending,
        totalInvites: totalContacts + totalPending
      },
    });

  } catch (error) {
    console.error('Erro ao buscar contatos do corretor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/broker/contacts - Enviar convite para usuário
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { email, notes } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado com este email' },
        { status: 404 }
      );
    }

    // Verificar se já existe um relacionamento
    const existingContact = await prisma.brokerContact.findUnique({
      where: {
        brokerId_userId: {
          brokerId: user.userId,
          userId: existingUser.id
        }
      }
    });

    if (existingContact) {
      if (existingContact.status === 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Este usuário já é seu contato' },
          { status: 409 }
        );
      } else if (existingContact.status === 'PENDING') {
        return NextResponse.json(
          { error: 'Convite já enviado para este usuário' },
          { status: 409 }
        );
      } else if (existingContact.status === 'DECLINED') {
        // Atualizar convite recusado para pendente
        const updatedContact = await prisma.brokerContact.update({
          where: { id: existingContact.id },
          data: {
            status: 'PENDING',
            invitedAt: new Date(),
            notes: notes || existingContact.notes
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Convite reenviado com sucesso',
          contact: updatedContact
        });
      }
    }

    // Criar novo convite
    const newContact = await prisma.brokerContact.create({
      data: {
        brokerId: user.userId,
        userId: existingUser.id,
        notes: notes || null,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Convite enviado com sucesso',
      contact: newContact
    });

  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/broker/contacts - Remover contato
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');

    if (!contactId) {
      return NextResponse.json(
        { error: 'ID do contato é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o contato pertence ao corretor
    const contact = await prisma.brokerContact.findFirst({
      where: {
        id: contactId,
        brokerId: user.userId
      }
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      );
    }

    // Remover contato
    await prisma.brokerContact.delete({
      where: { id: contactId }
    });

    return NextResponse.json({
      success: true,
      message: 'Contato removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover contato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
