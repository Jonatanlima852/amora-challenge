/**
 * Funções utilitárias para WhatsApp
 */

/**
 * Normaliza número de telefone para formato E.164
 * Remove @s.whatsapp.net e converte para formato padrão
 */
export function normalizePhoneE164(input: string): string {
  // Remove @s.whatsapp.net se presente
  let phone = input.replace(/@s\.whatsapp\.net$/, '');
  
  // Remove caracteres não numéricos
  phone = phone.replace(/\D/g, '');
  
  // Se começar com +, remove
  if (phone.startsWith('+')) {
    phone = phone.substring(1);
  }
  
  // Se começar com 00, remove (código internacional)
  if (phone.startsWith('00')) {
    phone = phone.substring(2);
  }
  
  // Se não começar com 55 (Brasil), adiciona
  if (!phone.startsWith('55')) {
    phone = '55' + phone;
  }
  
  return phone;
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