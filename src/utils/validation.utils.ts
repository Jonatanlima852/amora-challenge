/**
 * Utilitários de validação
 */

export function validatePropertyData(data: any): boolean {
  return !!(data.title && data.price && data.m2);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/@s\.whatsapp\.net$/, ''));
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
