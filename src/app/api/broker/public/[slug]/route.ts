import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/broker/public/[slug] - Perfil público do corretor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Buscar corretor pelo slug ou criar um slug baseado no nome se não existir
    let broker = await prisma.user.findFirst({
      where: {
        OR: [
          { slug: slug },
          { 
            name: { 
              contains: slug.replace(/-/g, ' '), 
              mode: 'insensitive' 
            },
            role: { in: ['BROKER', 'ADMIN'] }
          }
        ],
        role: { in: ['BROKER', 'ADMIN'] }
      },
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
        city: true,
        createdAt: true
      }
    });

    // Se não encontrou pelo slug, tentar buscar pelo nome
    if (!broker) {
      broker = await prisma.user.findFirst({
        where: {
          name: { 
            contains: slug.replace(/-/g, ' '), 
            mode: 'insensitive' 
          },
          role: { in: ['BROKER', 'ADMIN'] }
        },
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
          city: true,
          createdAt: true
        }
      });
    }

    if (!broker) {
      return NextResponse.json(
        { error: 'Corretor não encontrado' },
        { status: 404 }
      );
    }

          // Buscar propriedades em destaque do corretor
      const highlights = await prisma.property.findMany({
        where: {
          createdByUserId: broker.id,
          status: 'ACTIVE'
        },
        orderBy: { score: 'desc' },
        take: 6,
        select: {
          id: true,
          title: true,
          price: true,
          m2: true,
          neigh: true,
          city: true,
          score: true,
          photos: true,
          rooms: true,
          parking: true,
          condo: true,
          iptu: true
        }
      });

    // Buscar estatísticas do corretor
    const [totalProperties, activeProperties, totalContacts] = await Promise.all([
      prisma.property.count({
        where: { createdByUserId: broker.id }
      }),
      prisma.property.count({
        where: { 
          createdByUserId: broker.id,
          status: 'ACTIVE'
        }
      }),
      prisma.user.count({
        where: {
          OR: [
            { comments: { some: { property: { createdByUserId: broker.id } } } },
            { memberships: { some: { household: { lists: { some: { brokerId: broker.id } } } } } },
            { addedItems: { some: { list: { brokerId: broker.id } } } }
          ],
          id: { not: broker.id }
        }
      })
    ]);

    // Calcular rating baseado em propriedades e score médio
    const avgScore = highlights.length > 0 
      ? Math.round(highlights.reduce((sum, p) => sum + (p.score || 0), 0) / highlights.length)
      : 0;
    
    const rating = Math.min(5, Math.max(1, (avgScore / 20) + 3.5)); // Score 0-100 -> Rating 1-5

    return NextResponse.json({
      success: true,
      broker: {
        ...broker,
        phone: broker.phoneE164 || 'Telefone não informado',
        rating: Math.round(rating * 10) / 10,
                  highlights: highlights.map(property => ({
            id: property.id,
            title: property.title || 'Título não informado',
            price: property.price ? `R$ ${property.price.toLocaleString('pt-BR')}` : 'Preço sob consulta',
            area: property.m2 ? `${property.m2}m²` : 'Área não informada',
            neighborhood: property.neigh || 'Bairro não informado',
            city: property.city || 'Cidade não informada',
            type: 'Imóvel', // Tipo padrão
            amoraScore: property.score || 0,
            image: property.photos && Array.isArray(property.photos) && property.photos.length > 0 ? property.photos[0] : null,
            details: {
              rooms: property.rooms,
              parking: property.parking,
              condo: property.condo,
              iptu: property.iptu
            }
          }))
      },
      stats: {
        totalProperties,
        activeProperties,
        totalContacts,
        avgScore
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil público do corretor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
