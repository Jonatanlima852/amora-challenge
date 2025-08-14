import { ParsingResult, ParsedProperty, ParserConfig } from '../../../../types/property';

export async function parseVivaReal(url: string, config: ParserConfig): Promise<ParsingResult> {
  try {
    console.log('Parsing VivaReal:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      },
      signal: AbortSignal.timeout(config.timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    const property: ParsedProperty = {
      sourceUrl: url,
      parsedAt: new Date(),
      parser: 'viva-real'
    };

    // Título
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      property.title = titleMatch[1].trim().replace(/[^\w\s-]/g, '');
    }

    // Preço
    const priceMatch = html.match(/R\$\s*([\d.,]+)/g);
    if (priceMatch && priceMatch.length > 0) {
      const priceStr = priceMatch[0].replace(/[^\d]/g, '');
      property.price = parseInt(priceStr);
    }

    // Metragem
    const m2Match = html.match(/(\d+)\s*m²/);
    if (m2Match) {
      property.m2 = parseInt(m2Match[1]);
    }

    // Quartos
    const roomsMatch = html.match(/(\d+)\s*quarto/);
    if (roomsMatch) {
      property.rooms = parseInt(roomsMatch[1]);
    }

    // Vagas
    const parkingMatch = html.match(/(\d+)\s*vaga/);
    if (parkingMatch) {
      property.parking = parseInt(parkingMatch[1]);
    }

    // Bairro
    const neighMatch = html.match(/(?:bairro|localiza[çc][ãa]o)[^>]*>([^<]+)/i);
    if (neighMatch) {
      property.neigh = neighMatch[1].trim();
    }

    // Fotos
    const photoMatches = html.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi);
    if (photoMatches) {
      property.photos = photoMatches.slice(0, 5);
    }

    return { success: true, property };

  } catch (error) {
    console.error('Erro parsing VivaReal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
