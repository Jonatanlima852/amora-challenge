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

// POST /api/properties/compare - Comparar propriedades selecionadas
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
    const { propertyIds } = body;

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length < 2 || propertyIds.length > 4) {
      return NextResponse.json(
        { error: 'Selecione entre 2 e 4 propriedades para comparar' },
        { status: 400 }
      );
    }

    // Buscar propriedades do usuário
    const properties = await prisma.property.findMany({
      where: {
        id: { in: propertyIds },
        createdByUserId: user.userId,
        status: 'ACTIVE',
      },
      orderBy: {
        score: 'desc',
      },
      include: {
        createdBy: {
          select: {
            name: true,
            phoneE164: true,
          },
        },
      },
    });

    if (properties.length !== propertyIds.length) {
      return NextResponse.json(
        { error: 'Algumas propriedades não foram encontradas' },
        { status: 404 }
      );
    }

    // Calcular análise comparativa
    const analysis = generateComparisonAnalysis(
      properties.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price as number | null,
        m2: p.m2 as number | null,
        score: p.score as number | null,
        neigh: (p as any).neigh ?? null,
      }))
    );

    return NextResponse.json({
      success: true,
      properties,
      analysis,
    });

  } catch (error) {
    console.error('Erro ao comparar propriedades:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para gerar análise comparativa
type AnalyzableProperty = {
  id: string;
  title: string | null;
  price: number | null;
  m2: number | null;
  score: number | null;
  neigh?: string | null;
};

function generateComparisonAnalysis(properties: AnalyzableProperty[]) {
  if (properties.length === 0) return null;

  const prices = properties
    .map(p => p.price)
    .filter((n): n is number => typeof n === 'number');
  const areas = properties
    .map(p => p.m2)
    .filter((n): n is number => typeof n === 'number');
  const scores = properties
    .map(p => p.score)
    .filter((n): n is number => typeof n === 'number');

  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const avgArea = areas.length > 0 ? areas.reduce((a, b) => a + b, 0) / areas.length : 0;
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  // Encontrar melhor custo-benefício
  type BestValue = { property: AnalyzableProperty; ratio: number } | null;
  const bestValue = properties.reduce<BestValue>((best, current) => {
    if (!current.score || !current.price) return best;
    const valueRatio = current.score / (current.price / 1000000); // Score por milhão
    if (!best || valueRatio > best.ratio) {
      return { property: current, ratio: valueRatio };
    }
    return best;
  }, null);

  // Análise por categoria
  const analysis: {
    summary: {
      totalProperties: number;
      averagePrice: number;
      averageArea: number;
      averageScore: number;
      bestValueProperty: string | null;
    };
    recommendations: Array<{
      type: string;
      message: string;
      propertyId?: string;
    }>;
    prosAndCons: {
      pros: string[];
      cons: string[];
    };
  } = {
    summary: {
      totalProperties: properties.length,
      averagePrice: avgPrice,
      averageArea: avgArea,
      averageScore: avgScore,
      bestValueProperty: bestValue?.property?.id || null,
    },
    recommendations: [],
    prosAndCons: {
      pros: [],
      cons: [],
    },
  };

  // Gerar recomendações baseadas nos dados
  if (bestValue) {
    analysis.recommendations.push({
      type: 'best_value',
      message: `${bestValue.property.title} oferece o melhor custo-benefício com score ${bestValue.property.score}/100`,
      propertyId: bestValue.property.id,
    });
  }

  // Análise de preços
  const priceRange = prices.length > 0 ? Math.max(...prices) - Math.min(...prices) : 0;
  if (prices.length > 0 && priceRange > avgPrice * 0.5) {
    analysis.recommendations.push({
      type: 'price_variation',
      message: 'Há uma variação significativa de preços entre as opções selecionadas',
    });
  }

  // Análise de localização
  const neighborhoods = properties.map(p => p.neigh).filter(Boolean);
  const uniqueNeighborhoods = [...new Set(neighborhoods)];
  if (uniqueNeighborhoods.length > 1) {
    analysis.recommendations.push({
      type: 'location_diversity',
      message: `As propriedades estão distribuídas em ${uniqueNeighborhoods.length} bairros diferentes`,
    });
  }

  return analysis;
}
