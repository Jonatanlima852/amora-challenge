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
  
  if (phone.startsWith('+')) {
    phone = phone.substring(1);
  }
  
  if (phone.startsWith('00')) {
    phone = phone.substring(2);
  }
  
  if (!phone.startsWith('55')) {
    phone = '55' + phone;
  }
  
  return phone;
}
