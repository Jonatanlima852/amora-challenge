/**
 * Tipos para parsing e análise de imóveis
 */

export interface ParsedProperty {
  // Dados básicos
  title?: string;
  description?: string;
  
  // Preços e características
  price?: number;        // BRL
  m2?: number;          // metros quadrados
  condo?: number;       // condomínio mensal
  iptu?: number;        // IPTU anual
  rooms?: number;       // quartos
  parking?: number;     // vagas
  
  // Localização
  neigh?: string;       // bairro
  city?: string;        // cidade
  state?: string;       // estado
  zipCode?: string;     // CEP
  
  // Mídia
  photos?: string[];    // URLs das fotos
  
  // Metadados
  sourceUrl: string;
  parsedAt: Date;
  parser?: string;      // qual parser foi usado
}

export interface PropertyScore {
  score: number;        // 0-100
  reasons: string[];    // explicações do score
  breakdown: {
    pricePerM2: number;     // score do preço/m² (0-35)
    monthlyCost: number;    // score do custo mensal (0-25)
    requirements: number;   // score da aderência (0-20)
    commute: number;        // score do deslocamento (0-10)
    liquidity: number;      // score da liquidez (0-10)
  };
}

export interface ParsingResult {
  success: boolean;
  property?: ParsedProperty;
  score?: PropertyScore;
  error?: string;
  warnings?: string[];
}

export interface ParserConfig {
  timeout: number;      // timeout em ms
  retries: number;      // número de tentativas
  userAgent: string;    // user agent para requests
}

export type ParserFunction = (url: string, config: ParserConfig) => Promise<ParsingResult>;
