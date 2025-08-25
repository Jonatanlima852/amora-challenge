import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '../../../services/notifications';

export async function POST(request: NextRequest) {
  try {
    // Verificar header de autenticação
    const internalKey = request.headers.get('x-internal-key');
    const expectedKey = process.env.INTERNAL_API_KEY || 'amora_internal_key_2024';
    
    if (internalKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, body: messageBody } = body;

    if (!to || !messageBody) {
      return NextResponse.json({ 
        error: 'Missing required fields: to, body' 
      }, { status: 400 });
    }

    // Formatar número para Evolution API
    // Garantir que o número esteja no formato correto: 5562993234763@s.whatsapp.net
    let formattedNumber = to;
    
    // Se não começar com 55 (Brasil), adicionar
    if (!formattedNumber.startsWith('55')) {
      formattedNumber = '55' + formattedNumber;
    }
    
    // Adicionar sufixo @s.whatsapp.net se não existir
    if (!formattedNumber.includes('@s.whatsapp.net')) {
      formattedNumber = `${formattedNumber}@s.whatsapp.net`;
    }

    // Enviar mensagem com retry
    let success = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!success && attempts < maxAttempts) {
      attempts++;
      
      try {
        success = await WhatsAppService.sendMessage(formattedNumber, messageBody);
        
        if (success) {
          console.log(`Notificação enviada com sucesso para ${formattedNumber} (tentativa ${attempts})`);
          break;
        }
      } catch (error) {
        console.error(`Erro na tentativa ${attempts}:`, error);
      }

      // Aguardar antes da próxima tentativa (exponencial backoff)
      if (attempts < maxAttempts) {
        const delay = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to send message after all attempts',
        attempts 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent successfully',
      attempts 
    });

  } catch (error) {
    console.error('Erro no endpoint notify:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}
