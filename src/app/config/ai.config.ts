export const AI_CONFIG = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: 'gpt-4o-mini',
  TIMEOUT: 30000,
  MAX_TOKENS: 500,
  TEMPERATURE: 0.1
} as const;

export const SSL_CONFIG = {
  NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_ENV === 'development' ? '0' : '1'
} as const;