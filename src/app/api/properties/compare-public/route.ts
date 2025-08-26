import { NextRequest, NextResponse } from 'next/server';
import { AI_CONFIG } from '@/config/ai.config';
import { AIParserService } from '@/services/parsing';

// POST /api/properties/compare-public - Comparar propriedades públicas com IA
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyUrls } = body;

    if (!propertyUrls || !Array.isArray(propertyUrls) || propertyUrls.length < 2 || propertyUrls.length > 5) {
      return NextResponse.json(
        { error: 'Selecione entre 2 e 5 URLs de imóveis para comparar' },
        { status: 400 }
      );
    }

    // Validar URLs
    const validUrls = propertyUrls.filter(url => url && url.trim() !== '');
    if (validUrls.length < 2) {
      return NextResponse.json(
        { error: 'Pelo menos 2 URLs válidas são necessárias' },
        { status: 400 }
      );
    }

    // Parsear cada URL usando o serviço de parsing existente
    const parsingPromises = validUrls.map(async (url) => {
      try {
        const result = await AIParserService.parse(url);
        if (result.success && result.property) {
          return {
            id: `parsed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: result.property.title || 'Título não disponível',
            price: result.property.price || 0,
            m2: result.property.m2 || 0,
            score: calculatePropertyScore(result.property), // Calcular score baseado nos dados
            neigh: result.property.neigh || 'Bairro não informado',
            city: result.property.city || 'Cidade não informada',
            state: result.property.state || 'Estado não informado',
            rooms: result.property.rooms || 0,
            parking: result.property.parking || 0,
            condo: 0, // Não disponível no parsing básico
            iptu: 0, // Não disponível no parsing básico
            propertyType: 'Apartamento', // Default
            sourceUrl: url,
            parsedAt: result.property.parsedAt,
            parser: result.property.parser,
          };
        } else {
          throw new Error(result.error || 'Falha no parsing');
        }
      } catch (error) {
        console.error(`Erro ao fazer parsing de ${url}:`, error);
        // Retornar propriedade com dados básicos em caso de erro
        return {
          id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `Imóvel (Erro no parsing)`,
          price: 0,
          m2: 0,
          score: 50, // Score baixo para propriedades com erro
          neigh: 'Localização não disponível',
          city: 'Cidade não disponível',
          state: 'Estado não disponível',
          rooms: 0,
          parking: 0,
          condo: 0,
          iptu: 0,
          propertyType: 'Não informado',
          sourceUrl: url,
          parsedAt: new Date(),
          parser: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    });

    const parsedProperties = await Promise.all(parsingPromises);

    // Gerar análise comparativa com IA
    const analysis = await generatePublicComparisonAnalysis(parsedProperties);

    return NextResponse.json({
      success: true,
      properties: parsedProperties,
      analysis,
    });

  } catch (error) {
    console.error('Erro ao comparar propriedades públicas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para calcular score da propriedade baseado nos dados extraídos
function calculatePropertyScore(property: any): number {
  let score = 50; // Score base

  // Bônus por preço (quanto menor, melhor)
  if (property.price && property.price > 0) {
    if (property.price < 500000) score += 15;
    else if (property.price < 1000000) score += 10;
    else if (property.price < 2000000) score += 5;
  }

  // Bônus por área
  if (property.m2 && property.m2 > 0) {
    if (property.m2 > 100) score += 10;
    else if (property.m2 > 80) score += 8;
    else if (property.m2 > 60) score += 5;
  }

  // Bônus por quartos
  if (property.rooms && property.rooms > 0) {
    if (property.rooms >= 3) score += 8;
    else if (property.rooms >= 2) score += 5;
    else score += 2;
  }

  // Bônus por vagas
  if (property.parking && property.parking > 0) {
    score += property.parking * 3;
  }

  // Bônus por localização (se informada)
  if (property.neigh && property.city) {
    score += 5;
  }

  // Penalidade por dados faltantes
  const missingFields = [
    !property.price, !property.m2, !property.rooms, 
    !property.neigh, !property.city
  ].filter(Boolean).length;
  
  score -= missingFields * 3;

  return Math.max(0, Math.min(100, score));
}

// Função para gerar análise comparativa pública com IA
async function generatePublicComparisonAnalysis(properties: any[]) {
  try {
    // Criar prompt para a IA
    const prompt = createPublicComparisonPrompt(properties);

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
            Analise as propriedades fornecidas e gere insights profundos e úteis para ajudar na tomada de decisão.
            Seja específico, justifique suas recomendações e forneça análises que realmente ajudem.
            Considere que esta é uma análise pública para demonstração da plataforma.
            IMPORTANTE: Responda em português brasileiro de forma clara e objetiva.`
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
    return parsePublicAIResponse(aiAnalysis, properties);

  } catch (error) {
    console.error('Erro na análise com IA:', error);
    // Fallback para análise básica
    return generateBasicPublicAnalysis(properties);
  }
}

// Criar prompt para comparação pública
function createPublicComparisonPrompt(properties: any[]) {
  const propertiesText = properties.map((p, index) => `
IMÓVEL ${index + 1}:
- Título: ${p.title}
- Preço: R$ ${p.price?.toLocaleString() || 'N/A'}
- Área: ${p.m2 || 'N/A'}m²
- Score aMORA: ${p.score || 'N/A'}/100
- Localização: ${p.neigh}, ${p.city} - ${p.state}
- Quartos: ${p.rooms || 'N/A'}
- Vagas: ${p.parking || 'N/A'}
- Tipo: ${p.propertyType || 'N/A'}
- URL: ${p.sourceUrl}
- Parser usado: ${p.parser || 'N/A'}
${p.error ? `- Erro no parsing: ${p.error}` : ''}
`).join('\n');

  return `
Analise as seguintes propriedades imobiliárias e gere uma análise comparativa inteligente e útil:

${propertiesText}

Retorne APENAS um JSON válido com a seguinte estrutura:

{
  "executiveSummary": "Resumo executivo em 2-3 frases",
  "categoryAnalysis": {
    "bestValue": "Análise do melhor custo-benefício com justificativa",
    "location": "Análise de localização",
    "financial": "Análise financeira (preço, etc.)",
    "functionality": "Análise de espaço e funcionalidade"
  },
  "recommendations": [
    {
      "type": "tipo da recomendação",
      "message": "mensagem da recomendação",
      "priority": "high|medium|low"
    }
  ],
  "prosAndCons": {
    "pros": ["ponto positivo 1", "ponto positivo 2"],
    "cons": ["ponto de atenção 1", "ponto de atenção 2"]
  },
  "finalDecision": "Decisão final com justificativa clara",
  "propertyInsights": [
    {
      "propertyId": "id do imóvel",
      "insights": ["insight 1", "insight 2", "insight 3"]
    }
  ]
}

IMPORTANTE: 
- Retorne APENAS o JSON válido
- Seja específico e use números quando possível
- Justifique cada recomendação
- Responda em português brasileiro
- Não inclua texto antes ou depois do JSON
`;
}

// Parsear resposta da IA para comparação pública
function parsePublicAIResponse(aiResponse: string, properties: any[]) {
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON não encontrado na resposta da IA');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    
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
        pros: parsedResponse.prosAndCons?.pros || [],
        cons: parsedResponse.prosAndCons?.cons || [],
      },
      detailedAnalysis: {
        executiveSummary: parsedResponse.executiveSummary || '',
        categoryAnalysis: parsedResponse.categoryAnalysis ? 
          `**Melhor Custo-Benefício:** ${parsedResponse.categoryAnalysis.bestValue}\n\n` +
          `**Localização:** ${parsedResponse.categoryAnalysis.location}\n\n` +
          `**Análise Financeira:** ${parsedResponse.categoryAnalysis.financial}\n\n` +
          `**Funcionalidade:** ${parsedResponse.categoryAnalysis.functionality}` : '',
        recommendations: parsedResponse.recommendations?.map((r: any) => r.message).join('\n') || '',
        finalDecision: parsedResponse.finalDecision || '',
      },
      propertyInsights: properties.map(p => ({
        propertyId: p.id,
        insights: parsedResponse.propertyInsights?.find((pi: any) => pi.propertyId === p.id)?.insights || 
                 [`Score: ${p.score || 'N/A'}/100`, `Preço: R$ ${p.price?.toLocaleString() || 'N/A'}`],
        score: p.score,
      })),
    };

    // Processar recomendações da IA
    if (parsedResponse.recommendations) {
      analysis.recommendations = parsedResponse.recommendations.map((rec: any) => ({
        type: rec.type || 'general',
        message: rec.message,
        priority: rec.priority || 'medium',
      }));
    }

    // Identificar melhor custo-benefício
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
      // Adicionar recomendação de melhor custo-benefício se não existir
      if (!analysis.recommendations.find(r => r.type === 'best_value')) {
        analysis.recommendations.unshift({
          type: 'best_value',
          message: `${bestValue.property.title} oferece o melhor custo-benefício com score ${bestValue.property.score}/100`,
          propertyId: bestValue.property.id,
          priority: 'high',
        });
      }
    }

    // Adicionar recomendações baseadas na qualidade dos dados
    const propertiesWithErrors = properties.filter(p => p.error);
    if (propertiesWithErrors.length > 0) {
      analysis.recommendations.push({
        type: 'data_quality',
        message: `${propertiesWithErrors.length} imóvel(is) tiveram problemas no parsing. Considere verificar as URLs.`,
        priority: 'medium',
      });
    }

    // Adicionar recomendações baseadas nos dados extraídos
    const prices = properties.map(p => p.price).filter((n): n is number => typeof n === 'number' && n > 0);
    if (prices.length > 0) {
      const priceRange = Math.max(...prices) - Math.min(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      if (priceRange > avgPrice * 0.5) {
        analysis.recommendations.push({
          type: 'price_variation',
          message: 'Há uma variação significativa de preços entre as opções selecionadas',
          priority: 'medium',
        });
      }
    }

    // Adicionar insights sobre localização
    const neighborhoods = properties.map(p => p.neigh).filter(Boolean);
    const uniqueNeighborhoods = [...new Set(neighborhoods)];
    if (uniqueNeighborhoods.length > 1) {
      analysis.recommendations.push({
        type: 'location_diversity',
        message: `As propriedades estão distribuídas em ${uniqueNeighborhoods.length} bairros diferentes`,
        priority: 'low',
      });
    }

    return analysis;

  } catch (error) {
    console.error('Erro ao parsear resposta da IA como JSON:', error);
    console.log('Resposta da IA:', aiResponse);
    
    // Fallback para análise básica se o JSON falhar
    return generateBasicPublicAnalysis(properties);
  }
}

// Análise básica como fallback
function generateBasicPublicAnalysis(properties: any[]) {
  const prices = properties
    .map(p => p.price)
    .filter((n): n is number => typeof n === 'number' && n > 0);
  const areas = properties
    .map(p => p.m2)
    .filter((n): n is number => typeof n === 'number' && n > 0);
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
        message: 'Análise básica realizada. Para insights mais profundos, crie uma conta gratuita.',
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
      recommendations: '',
      finalDecision: '',
    },
    propertyInsights: properties.map(p => ({
      propertyId: p.id,
      insights: [`Score: ${p.score || 'N/A'}/100`, `Preço: R$ ${p.price?.toLocaleString() || 'N/A'}`],
      score: p.score,
    })),
  };
}
