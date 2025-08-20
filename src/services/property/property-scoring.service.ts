import { ParsedProperty, PropertyScore } from '../../types/property';

/**
 * Sistema de scoring para imóveis (Índice aMORA)
 * Calcula score de 0-100 baseado em múltiplos fatores
 */
export class PropertyScoringService {
  private static readonly WEIGHTS = {
    pricePerM2: 0.35,    // 35% - preço por m²
    monthlyCost: 0.25,   // 25% - custo mensal total
    requirements: 0.20,   // 20% - aderência aos requisitos
    commute: 0.10,        // 10% - tempo de deslocamento
    liquidity: 0.10       // 10% - liquidez do mercado
  };

  /**
   * Calcula o score completo do imóvel
   */
  static calculateScore(property: ParsedProperty): PropertyScore {
    const breakdown = {
      pricePerM2: this.calculatePricePerM2Score(property),
      monthlyCost: this.calculateMonthlyCostScore(property),
      requirements: this.calculateRequirementsScore(property),
      commute: this.calculateCommuteScore(property),
      liquidity: this.calculateLiquidityScore(property)
    };

    const finalScore = Math.round(
      breakdown.pricePerM2 * this.WEIGHTS.pricePerM2 +
      breakdown.monthlyCost * this.WEIGHTS.monthlyCost +
      breakdown.requirements * this.WEIGHTS.requirements +
      breakdown.commute * this.WEIGHTS.commute +
      breakdown.liquidity * this.WEIGHTS.liquidity
    );

    const reasons = this.generateReasons(property, breakdown);

    return {
      score: Math.max(0, Math.min(100, finalScore)),
      reasons,
      breakdown
    };
  }

  /**
   * Score do preço por m² (0-100)
   */
  private static calculatePricePerM2Score(property: ParsedProperty): number {
    if (!property.price || !property.m2) return 50;

    const pricePerM2 = property.price / property.m2;
    const neighborhoodMedian = this.getMockNeighborhoodMedian(property.neigh);
    if (!neighborhoodMedian) return 50;

    const difference = ((pricePerM2 - neighborhoodMedian) / neighborhoodMedian) * 100;
    
    if (difference <= -20) return 100;
    if (difference <= -10) return 85;
    if (difference <= 0) return 70;
    if (difference <= 10) return 50;
    if (difference <= 20) return 30;
    return 15;
  }

  /**
   * Score do custo mensal total (0-100)
   */
  private static calculateMonthlyCostScore(property: ParsedProperty): number {
    if (!property.price) return 50;

    const monthlyRent = property.price * 0.006;
    const monthlyCondo = property.condo || 0;
    const monthlyIptu = (property.iptu || 0) / 12;
    
    const totalMonthly = monthlyRent + monthlyCondo + monthlyIptu;
    
    if (totalMonthly <= 2000) return 100;
    if (totalMonthly <= 3500) return 80;
    if (totalMonthly <= 5000) return 60;
    if (totalMonthly <= 7000) return 40;
    return 20;
  }

  /**
   * Score da aderência aos requisitos (0-100)
   */
  private static calculateRequirementsScore(property: ParsedProperty): number {
    let score = 50;

    if (property.rooms) {
      if (property.rooms >= 2 && property.rooms <= 3) score += 20;
      else if (property.rooms >= 1 && property.rooms <= 4) score += 10;
    }

    if (property.parking && property.parking > 0) score += 15;

    if (property.m2) {
      if (property.m2 >= 50 && property.m2 <= 120) score += 15;
      else if (property.m2 >= 30 && property.m2 <= 150) score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Score do tempo de deslocamento (0-100)
   */
  private static calculateCommuteScore(property: ParsedProperty): number {
    const commuteScores: Record<string, number> = {
      'vila madalena': 90,
      'pinheiros': 85,
      'jardins': 80,
      'vila olimpia': 75,
      'itaim bibi': 70,
      'mooca': 65,
      'tatuape': 60,
      'santana': 55,
      'jabaquara': 50
    };

    if (property.neigh) {
      const normalizedNeigh = property.neigh.toLowerCase().trim();
      for (const [key, score] of Object.entries(commuteScores)) {
        if (normalizedNeigh.includes(key)) return score;
      }
    }

    return 50;
  }

  /**
   * Score da liquidez do mercado (0-100)
   */
  private static calculateLiquidityScore(property: ParsedProperty): number {
    const highLiquidityNeighborhoods = ['vila madalena', 'pinheiros', 'jardins', 'vila olimpia'];
    
    if (property.neigh) {
      const normalizedNeigh = property.neigh.toLowerCase().trim();
      if (highLiquidityNeighborhoods.some(n => normalizedNeigh.includes(n))) {
        return 90;
      }
    }

    if (property.m2) {
      if (property.m2 >= 40 && property.m2 <= 100) return 80;
      if (property.m2 >= 30 && property.m2 <= 120) return 70;
    }

    return 60;
  }

  /**
   * Gera explicações humanas para o score
   */
  private static generateReasons(property: ParsedProperty, breakdown: PropertyScore['breakdown']): string[] {
    const reasons: string[] = [];

    if (breakdown.pricePerM2 >= 80) {
      reasons.push('�� Preço/m² excelente vs bairro');
    } else if (breakdown.pricePerM2 >= 60) {
      reasons.push('✅ Preço/m² bom vs bairro');
    } else if (breakdown.pricePerM2 <= 30) {
      reasons.push('⚠️ Preço/m² alto vs bairro');
    }

    if (breakdown.monthlyCost >= 80) {
      reasons.push('�� Custo mensal muito acessível');
    } else if (breakdown.monthlyCost <= 30) {
      reasons.push('💸 Custo mensal elevado');
    }

    if (breakdown.requirements >= 80) {
      reasons.push('�� Perfeito para suas necessidades');
    } else if (breakdown.requirements >= 60) {
      reasons.push('👍 Atende bem aos requisitos');
    }

    if (breakdown.commute >= 80) {
      reasons.push('🚇 Excelente localização');
    } else if (breakdown.commute <= 40) {
      reasons.push('⏰ Localização pode ser distante');
    }

    if (breakdown.liquidity >= 80) {
      reasons.push('📈 Alta liquidez no mercado');
    }

    return reasons;
  }

  /**
   * Mock: retorna mediana do bairro
   */
  private static getMockNeighborhoodMedian(neighborhood?: string): number | null {
    if (!neighborhood) return null;

    const medians: Record<string, number> = {
      'vila madalena': 8500,
      'pinheiros': 9000,
      'jardins': 12000,
      'vila olimpia': 11000,
      'itaim bibi': 13000,
      'mooca': 6500,
      'tatuape': 6000,
      'santana': 5500,
      'jabaquara': 5000
    };

    const normalizedNeigh = neighborhood.toLowerCase().trim();
    for (const [key, median] of Object.entries(medians)) {
      if (normalizedNeigh.includes(key)) return median;
    }

    return 8000;
  }
}
