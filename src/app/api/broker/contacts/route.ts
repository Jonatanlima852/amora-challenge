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

    // Buscar usuários que interagiram com propriedades do corretor
    // ou que foram adicionados a grupos do corretor
    const contacts = await prisma.user.findMany({
      where: {
        OR: [
          // Usuários que comentaram em propriedades do corretor
          {
            comments: {
              some: {
                property: {
                  createdByUserId: user.userId
                }
              }
            }
          },
          // Usuários que são membros de grupos do corretor
          {
            memberships: {
              some: {
                household: {
                  lists: {
                    some: {
                      brokerId: user.userId
                    }
                  }
                }
              }
            }
          },
          // Usuários que adicionaram propriedades do corretor às suas listas
          {
            addedItems: {
              some: {
                list: {
                  brokerId: user.userId
                }
              }
            }
          }
        ],
        // Excluir o próprio corretor
        id: { not: user.userId }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneE164: true,
        city: true,
        createdAt: true,
        // Contar interações
        _count: {
          select: {
            comments: {
              where: {
                property: {
                  createdByUserId: user.userId
                }
              }
            },
            memberships: {
              where: {
                household: {
                  lists: {
                    some: {
                      brokerId: user.userId
                    }
                  }
                }
              }
            },
            addedItems: {
              where: {
                list: {
                  brokerId: user.userId
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular estatísticas
    const totalContacts = contacts.length;
    const activeContacts = contacts.filter(c => 
      c._count.comments > 0 || 
      c._count.memberships > 0 || 
      c._count.addedItems > 0
    ).length;

    return NextResponse.json({
      success: true,
      contacts: contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phoneE164: contact.phoneE164,
        city: contact.city,
        createdAt: contact.createdAt,
        interactionCount: 
          contact._count.comments + 
          contact._count.memberships + 
          contact._count.addedItems,
        lastInteraction: contact.createdAt, // TODO: Implementar lógica de última interação
      })),
      stats: {
        total: totalContacts,
        active: activeContacts,
        inactive: totalContacts - activeContacts,
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

// POST /api/broker/contacts - Criar novo contato (opcional, para casos onde o corretor quer adicionar contatos manualmente)
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
    const { name, email, phoneE164, city, notes } = body;

    if (!name || (!email && !phoneE164)) {
      return NextResponse.json(
        { error: 'Nome e pelo menos um contato (email ou telefone) são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe um usuário com este email ou telefone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phoneE164: phoneE164 || undefined }
        ].filter(Boolean)
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este email ou telefone' },
        { status: 409 }
      );
    }

    // Criar novo usuário como contato
    const newContact = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phoneE164: phoneE164 || null,
        city: city || null,
        role: 'USER',
        verified: false,
      }
    });

    return NextResponse.json({
      success: true,
      contact: {
        id: newContact.id,
        name: newContact.name,
        email: newContact.email,
        phoneE164: newContact.phoneE164,
        city: newContact.city,
        createdAt: newContact.createdAt,
        interactionCount: 0,
        lastInteraction: newContact.createdAt,
      },
    });

  } catch (error) {
    console.error('Erro ao criar contato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
