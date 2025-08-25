/**
 * Utilitários comuns para o sistema
 */

/**
 * Parse número removendo caracteres não numéricos
 */
export function parseNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  
  const numStr = String(value).replace(/[^\d]/g, '');
  const num = parseInt(numStr);
  
  return isNaN(num) ? null : num;
}

/**
 * Extrai domínio da URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return 'unknown';
  }
}

/**
 * Valida se uma string é uma URL válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extrai a primeira URL encontrada em um texto
 */
export function extractFirstUrl(text: string): string | null {
  const urlRegex = /https?:\/\/[^\s]+/i;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

/**
 * Normaliza número de telefone para formato E.164
 */
export function normalizePhoneE164(input: string): string {
  let phone = input.replace(/@s\.whatsapp\.net$/, '');
  phone = phone.replace(/\D/g, '');
  
  // '+' e '00' já teriam sido removidos por /\D/g, mas mantemos por segurança
  if (phone.startsWith('+')) phone = phone.substring(1);
  if (phone.startsWith('00')) phone = phone.substring(2);
  
  if (!phone.startsWith('55')) {
    phone = '55' + phone;
  }
  
  return phone;
}

/**
 * Retorna candidatos E.164 considerando todas as variações possíveis de telefone brasileiro
 * Exemplos de entrada aceitos: 62993234763, 5562993234763, 556293234763
 * Retorna todas as possibilidades para garantir match na busca
 */
export function getBrazilPhoneE164Candidates(input: string): string[] {
  // Normalizar entrada removendo caracteres especiais
  let phone = input.replace(/@s\.whatsapp\.net$/, '').replace(/\D/g, '');
  
  const candidates = new Set<string>();
  
  // Se começa com 55, remover para processar
  if (phone.startsWith('55')) {
    phone = phone.slice(2);
  }
  
  // Agora phone é o número local (ex: 62993234763 ou 6293234763)
  
  if (phone.length === 11) {
    // Formato: DDD + 9 + número (ex: 62993234763)
    const ddd = phone.slice(0, 2);
    const nine = phone.slice(2, 3);
    const number = phone.slice(3);
    
    // Adicionar todas as variações possíveis
    candidates.add('55' + ddd + nine + number);        // 5562993234763 (com 55, com 9)
    candidates.add('55' + ddd + number);               // 556293234763 (com 55, sem 9)
    candidates.add(ddd + nine + number);               // 62993234763 (sem 55, com 9)
    candidates.add(ddd + number);                      // 6293234763 (sem 55, sem 9)
    
  } else if (phone.length === 10) {
    // Formato: DDD + número (ex: 6293234763)
    const ddd = phone.slice(0, 2);
    const number = phone.slice(2);
    
    // Adicionar todas as variações possíveis
    candidates.add('55' + ddd + number);               // 556293234763 (com 55, sem 9)
    candidates.add('55' + ddd + '9' + number);        // 5562993234763 (com 55, com 9)
    candidates.add(ddd + number);                      // 6293234763 (sem 55, sem 9)
    candidates.add(ddd + '9' + number);               // 62993234763 (sem 55, com 9)
    
  } else if (phone.length === 13) {
    // Formato: 55 + DDD + 9 + número (ex: 5562993234763)
    const ddd = phone.slice(2, 4);
    const nine = phone.slice(4, 5);
    const number = phone.slice(5);
    
    // Adicionar todas as variações possíveis
    candidates.add(phone);                             // 5562993234763 (original)
    candidates.add('55' + ddd + number);               // 556293234763 (sem 9)
    candidates.add(ddd + nine + number);               // 62993234763 (sem 55, com 9)
    candidates.add(ddd + number);                      // 6293234763 (sem 55, sem 9)
    
  } else if (phone.length === 12) {
    // Formato: 55 + DDD + número (ex: 556293234763)
    const ddd = phone.slice(2, 4);
    const number = phone.slice(4);
    
    // Adicionar todas as variações possíveis
    candidates.add(phone);                             // 556293234763 (original)
    candidates.add('55' + ddd + '9' + number);        // 5562993234763 (com 9)
    candidates.add(ddd + number);                      // 6293234763 (sem 55, sem 9)
    candidates.add(ddd + '9' + number);               // 62993234763 (sem 55, com 9)
  }
  
  // Adicionar também o número original normalizado
  candidates.add(normalizePhoneE164(input));
  
  // Filtrar apenas números válidos (10-13 dígitos)
  const validCandidates = Array.from(candidates).filter(candidate => 
    candidate.length >= 10 && candidate.length <= 13
  );
  
  
  return validCandidates;
}

/** Número nacional (sem 55), somente dígitos */
export function toBrazilNationalNumber(input: string): string {
  let phone = input.replace(/@s\.whatsapp\.net$/, '').replace(/\D/g, '');
  if (phone.startsWith('55')) phone = phone.slice(2);
  return phone;
}


// Retorna candi