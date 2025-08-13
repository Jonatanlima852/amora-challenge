/**
 * Serviço para enviar mensagens via Evolution API
 */

/**
 * Envia mensagem de texto via Evolution API
 */
export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<boolean> {
  try {
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'amora-mvp-test';
    const apiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_API_KEY || 'amora_whatsapp_mvp_evolution_api_2024_secret_key';

    // Garantir que o número está no formato correto para Evolution API
    const formattedNumber = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

    const response = await fetch(
      `${apiUrl}/instance/${instanceName}/sendText/${formattedNumber}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({ text: body })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao enviar mensagem:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log('Mensagem enviada com sucesso:', result);
    return true;

  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    return false;
  }
}

/**
 * Envia mensagem de mídia via Evolution API
 */
export async function sendWhatsAppMedia(
  to: string,
  mediaUrl: string,
  caption?: string
): Promise<boolean> {
  try {
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'amora-mvp';
    const apiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_API_KEY || 'amora_whatsapp_mvp_evolution_api_2024_secret_key';

    const formattedNumber = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

    const response = await fetch(
      `${apiUrl}/instance/${instanceName}/sendMedia/${formattedNumber}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
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
    console.log('Mídia enviada com sucesso:', result);
    return true;

  } catch (error) {
    console.error('Erro ao enviar mídia WhatsApp:', error);
    return false;
  }
}

/**
 * Verifica status da instância Evolution API
 */
export async function checkInstanceStatus(): Promise<boolean> {
  try {
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'amora-mvp-test';
    const apiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_API_KEY || 'amora_whatsapp_mvp_evolution_api_2024_secret_key';

    const response = await fetch(
      `${apiUrl}/instance/${instanceName}/info`,
      {
        headers: {
          'apikey': apiKey
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