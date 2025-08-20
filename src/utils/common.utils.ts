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
 * Retorna candidatos E.164 considerando variações com/sem o "9" logo após o DDD
 * Exemplos de entrada aceitos: 62993234763, 5562993234763, 556293234763
 */
export function getBrazilPhoneE164Candidates(input: string): string[] {
  const base = normalizePhoneE164(input);
  const local = base.slice(2); // remove 55
  const candidates = new Set<string>([base]);

  if (local.length === 10) {
    // insere '9' após DDD
    candidates.add('55' + local.slice(0, 2) + '9' + local.slice(2));
  } else if (local.length === 11 && local[2] === '9') {
    // remove '9' após DDD
    candidates.add('55' + local.slice(0, 2) + local.slice(3));
  }

  return Array.from(candidates);
}

/** Número nacional (sem 55), somente dígitos */
export function toBrazilNationalNumber(input: string): string {
  let phone = input.replace(/@s\.whatsapp\.net$/, '').replace(/\D/g, '');
  if (phone.startsWith('55')) phone = phone.slice(2);
  return phone;
}


// Retorna candi