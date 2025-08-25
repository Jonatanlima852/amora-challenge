import { WHATSAPP_CONFIG } from '../../config';

/**
 * Serviço para enviar mensagens via Evolution API
 */
export class WhatsAppService {
  /**
   * Envia mensagem de texto via Evolution API
   */
  static async sendMessage(
    to: string,
    body: string
  ): Promise<boolean> {
    try {
      const formattedNumber = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

      const url = `${WHATSAPP_CONFIG.API_URL}/message/sendText/${WHATSAPP_CONFIG.INSTANCE_NAME}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': WHATSAPP_CONFIG.API_KEY
        },
        body: JSON.stringify({ 
          number: formattedNumber,
          text: body 
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao enviar mensagem:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      return true;

    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  /**
   * Envia mensagem de mídia via Evolution API
   */
  static async sendMedia(
    to: string,
    mediaUrl: string,
    caption?: string
  ): Promise<boolean> {
    try {
      const formattedNumber = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

      const response = await fetch(
        `${WHATSAPP_CONFIG.API_URL}/instance/${WHATSAPP_CONFIG.INSTANCE_NAME}/sendMedia/${formattedNumber}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': WHATSAPP_CONFIG.API_KEY
          },
          body: JSON.stringify({
            mediaMessage: {
              url: mediaUrl,
              caption: caption || ''
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao enviar mídia:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      return true;

    } catch (error) {
      console.error('Erro ao enviar mídia WhatsApp:', error);
      return false;
    }
  }

  /**
   * Verifica status da instância Evolution API
   */
  static async checkInstanceStatus(): Promise<boolean> {
    try {
      const response = await fetch(
        `${WHATSAPP_CONFIG.API_URL}/instance/${WHATSAPP_CONFIG.INSTANCE_NAME}/info`,
        {
          headers: {
            'apikey': WHATSAPP_CONFIG.API_KEY
          }
        }
      );

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.status === 'open';
    } catch (error) {
      console.error('Erro ao verificar status da instância:', error);
      return false;
    }
  }

  /**
   * Envia código de verificação específico
   */
  static async sendVerificationCode(
    phone: string,
    code: string
  ): Promise<boolean> {
    const message = `🔐 Seu código de verificação aMORA: *${code}*\n\n⏰ Este código expira em 10 minutos.\n\n⚠️ Não compartilhe este código com ninguém.`;
    
    return await this.sendMessage(phone, message);
  }
}