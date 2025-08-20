export const WHATSAPP_CONFIG = {
  INSTANCE_NAME: process.env.EVOLUTION_INSTANCE_NAME || 'amora-mvp-test',
  API_URL: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
  API_KEY: process.env.EVOLUTION_API_KEY || 'amora_whatsapp_mvp_evolution_api_2024_secret_key'
} as const;

export const MESSAGE_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000
} as const;
