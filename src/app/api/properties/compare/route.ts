import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AI_CONFIG } from '@/config/ai.config';

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

// POST /api/properties/compare - Comparar propriedades com IA
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

    // Buscar preferências do usuário
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: user.userId },
      select: {
        minPrice: true,
        maxPrice: true,
        neighborhoods: true,
        minArea: true,
        maxArea: true,
        minParking: true,
        propertyTypes: true,
      },
    });

    // Gerar análise comparativa com IA
    const analysis = await generateAIComparisonAnalysis(properties, userPreferences);

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

// Função para gerar análise comparativa com IA
async function generateAIComparisonAnalysis(properties: any[], userPreferences: any) {
  try {
    // Preparar dados para a IA
    const propertiesData = properties.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      m2: p.m2,
      score: p.score,
      neigh: p.neigh,
      city: p.city,
      state: p.state,
      rooms: p.rooms,
      parking: p.parking,
      condo: p.condo,
      iptu: p.iptu,
      propertyType: p.propertyType,
      sourceUrl: p.sourceUrl,
      createdAt: p.createdAt,
    }));

    const preferencesData = userPreferences ? {
      budgetRange: `${userPreferences.budgetMin || 0} - ${userPreferences.budgetMax || 'ilimitado'}`,
      preferredNeighborhoods: userPreferences.preferredNeighborhoods || [],
      areaRange: `${userPreferences.minArea || 0} - ${userPreferences.maxArea || 'ilimitado'}m²`,
      parkingSpaces: userPreferences.parkingSpaces,
      rooms: userPreferences.rooms,
      propertyType: userPreferences.propertyType,
      priorities: userPreferences.priorities || [],
    } : null;

    // Criar prompt para a IA
    const prompt = createComparisonPrompt(propertiesData, preferencesData);

    // Chamar OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em análise de imóveis e consultor imobiliário experiente. 
            Analise as propriedades fornecidas e gere insights profundos e personalizados baseados nas preferências do usuário.
            Seja específico, justifique suas recomendações e forneça análises que realmente ajudem na tomada de decisão.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro na API da OpenAI');
    }

    const data = await response.json();
    const aiAnalysis = data.choices[0]?.message?.content;

    // Parsear a resposta da IA
    return parseAIResponse(aiAnalysis, propertiesData);

  } catch (error) {
    console.error('Erro na análise com IA:', error);
    // Fallback para análise básica
    return generateBasicAnalysis(properties);
  }
}

// Criar prompt detalhado para a IA
function createComparisonPrompt(properties: any[], preferences: any) {
  const propertiesText = properties.map((p, index) => `
IMÓVEL ${index + 1}:
- Título: ${p.title}
- Preço: R$ ${p.price?.toLocaleString() || 'N/A'}
- Área: ${p.m2 || 'N/A'}m²
- Score aMORA: ${p.score || 'N/A'}/100
- Localização: ${p.neigh}, ${p.city} - ${p.state}
- Quartos: ${p.rooms || 'N/A'}
- Vagas: ${p.parking || 'N/A'}
- Condomínio: R$ ${p.condo?.toLocaleString() || 'Incluso'}
- IPTU: R$ ${p.iptu?.toLocaleString() || 'N/A'}
- Tipo: ${p.propertyType || 'N/A'}
- URL: ${p.sourceUrl}
`).join('\n');

  const preferencesText = preferences ? `
PREFERÊNCIAS DO USUÁRIO:
- Faixa de preço: R$ ${preferences.budgetRange}
- Bairros preferidos: ${preferences.preferredNeighborhoods.join(', ') || 'Nenhum específico'}
- Faixa de área: ${preferences.areaRange}
- Vagas de estacionamento: ${preferences.parkingSpaces || 'N/A'}
- Quartos: ${preferences.rooms || 'N/A'}
- Tipo de propriedade: ${preferences.propertyType || 'N/A'}
- Prioridades: ${preferences.priorities.join(', ') || 'Nenhuma específica'}
` : '';

  return `
Analise as seguintes propriedades imobiliárias e gere uma análise comparativa inteligente e personalizada:

${propertiesText}

${preferencesText}

Gere uma análise que inclua:

1. RESUMO EXECUTIVO (máximo 3 frases)
2. ANÁLISE POR CATEGORIA:
   - Melhor custo-benefício (justifique com números)
   - Análise de localização (considerando preferências)
   - Análise financeira (preço, condomínio, IPTU)
   - Análise de espaço e funcionalidade
3. RECOMENDAÇÕES PERSONALIZADAS (baseadas nas preferências)
4. PROS E CONTRAS de cada propriedade
5. DECISÃO FINAL com justificativa
6. INSIGHTS ESPECÍFICOS sobre cada imóvel

Seja específico, use números quando possível, e justifique cada recomendação. 
Considere as preferências do usuário para personalizar a análise.
Responda em português brasileiro de forma clara e objetiva.
`;
}

// Parsear resposta da IA
function parseAIResponse(aiResponse: string, properties: any[]) {
  // Dividir a resposta em seções
  const sections = aiResponse.split(/\d+\.\s+/).filter(Boolean);
  
  const analysis = {
    summary: {
      totalProperties: properties.length,
      aiInsights: aiResponse,
      bestValueProperty: null as string | null,
    },
    recommendations: [] as Array<{
      type: string;
      message: string;
      propertyId?: string;
      priority: 'high' | 'medium' | 'low';
    }>,
    prosAndCons: {
      pros: [] as string[],
      cons: [] as string[],
    },
    detailedAnalysis: {
      executiveSummary: '',
      categoryAnalysis: '',
      personalizedRecommendations: '',
      finalDecision: '',
    },
    propertyInsights: properties.map(p => ({
      propertyId: p.id,
      insights: [] as string[],
      score: p.score,
    })),
  };

  // Extrair insights específicos de cada propriedade
  properties.forEach(property => {
    const propertyInsight = analysis.propertyInsights.find(pi => pi.propertyId === property.id);
    if (propertyInsight) {
      // Buscar por menções específicas da propriedade na resposta da IA
      const propertyMentions = aiResponse.match(new RegExp(`${property.title}[^.]*`, 'gi'));
      if (propertyMentions) {
        propertyInsight.insights = propertyMentions.slice(0, 3); // Máximo 3 insights por propriedade
      }
    }
  });

  // Identificar melhor custo-benefício baseado no score
  const bestValue = properties.reduce((best, current) => {
    if (!current.score || !current.price) return best;
    const valueRatio = current.score / (current.price / 1000000);
    if (!best || valueRatio > best.ratio) {
      return { property: current, ratio: valueRatio };
    }
    return best;
  }, null as any);

  if (bestValue) {
    analysis.summary.bestValueProperty = bestValue.property.id;
    analysis.recommendations.push({
      type: 'best_value',
      message: `${bestValue.property.title} oferece o melhor custo-benefício com score ${bestValue.property.score}/100`,
      propertyId: bestValue.property.id,
      priority: 'high',
    });
  }

  return analysis;
}

// Análise básica como fallback
function generateBasicAnalysis(properties: any[]) {
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

  return {
    summary: {
      totalProperties: properties.length,
      averagePrice: avgPrice,
      averageArea: avgArea,
      averageScore: avgScore,
      bestValueProperty: null,
      aiInsights: 'Análise básica (IA indisponível)',
    },
    recommendations: [
      {
        type: 'basic_analysis',
        message: 'Análise básica realizada. Para insights mais profundos, tente novamente.',
        priority: 'medium',
      },
    ],
    prosAndCons: {
      pros: [],
      cons: [],
    },
    detailedAnalysis: {
      executiveSummary: 'Análise básica das propriedades selecionadas',
      categoryAnalysis: '',
      personalizedRecommendations: '',
      finalDecision: '',
    },
    propertyInsights: properties.map(p => ({
      propertyId: p.id,
      insights: [`Score: ${p.score || 'N/A'}/100`, `Preço: R$ ${p.price?.toLocaleString() || 'N/A'}`],
      score: p.score,
    })),
  };
}
