/**
 * Tipos para integração com Evolution API
 */

export interface EvolutionWebhookPayload {
  event: string;
  data: {
    messages: EvolutionMessage[];
  };
}

export interface EvolutionMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
  messageTimestamp: number;
  pushName?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SendMessageParams {
  to: string;
  body: string;
  mediaUrl?: string;
  caption?: string;
}
