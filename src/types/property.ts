/**
 * Tipos para parsing e análise de imóveis
 */

export interface ParsedProperty {
  id?: string;
  sourceUrl: string;
  parsedAt: Date;
  parser: string;
  title: string;
  price?: number;
  m2?: number;
  condo?: number;
  iptu?: number;
  rooms?: number;
  parking?: number;
  neigh?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  photos?: string[];
  // Adicionar propriedades que faltam
  score?: number;
  scoreReasons?: string[];
  status?: string;
  createdAt?: Date;
  createdBy?: {
    name?: string;
    phoneE164?: string;
  };
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
