import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhoneE164, extractFirstUrl } from '../../../../utils';
import { WhatsAppService } from '../../../../services/notifications';
import { MessageTemplatesService } from '../../../../services/notifications';
import { PropertyService } from '../../../../services/property';


export async function POST(request: NextRequest) {
  try {
    // Log de todos os headers recebidos
    console.log('=== WEBHOOK RECEBIDO ===');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    // Log do body completo
    const payload = await request.json();
    console.log('Body completo:', JSON.stringify(payload, null, 2));
    
    // Verificar se é evento de mensagem recebida
    if (payload.event !== 'messages.upsert') {
      console.log('Evento ignorado:', payload.event);
      return NextResponse.json({ success: true });
    }

    // Extrair dados da mensagem
    const message = payload.data;
    if (!message?.key?.remoteJid || message?.fromMe) {
      console.log('Mensagem ignorada (fromMe ou sem remoteJid)');
      return NextResponse.json({ success: true });
    }

    const from = message.key.remoteJid;
    const body = message.message?.conversation || 
                 message.message?.extendedTextMessage?.text || 
                 '';
    const timestamp = message.messageTimestamp;
    const pushName = message.pushName;

    console.log('=== DADOS DA MENSAGEM ===');
    console.log('De:', from);
    console.log('Corpo:', body);
    console.log('Timestamp:', timestamp);
    console.log('Push Name:', pushName);

    if (!from || !body) {
      console.log('Mensagem sem conteúdo válido');
      return NextResponse.json({ success: true });
    }

    // Normalizar telefone (remover @s.whatsapp.net)
    const phoneE164 = normalizePhoneE164(from);
    
    // Upsert usuário
    const user = await prisma.user.upsert({
      where: { phoneE164 },
      create: { 
        phoneE164,
        name: pushName || undefined
      },
      update: {
        name: pushName || undefined
      }
    });

    // Extrair URL da mensagem
    const url = extractFirstUrl(body);
    
    if (!url) {
      // Verificar se é mensagem de ajuda
      const lowerBody = body.toLowerCase();
      let responseMessage: string;
      
      if (lowerBody.includes('ajuda') || lowerBody.includes('help') || lowerBody.includes('oi') || lowerBody.includes('olá')) {
        responseMessage = MessageTemplatesService.welcomeMessage();
        console.log(`📱 Enviando mensagem de boas-vindas para ${from}`);
      } else {
        responseMessage = MessageTemplatesService.noUrlFound();
        console.log(`📱 Enviando mensagem de ajuda para ${from}`);
      }
      
      try {
        const messageSent = await WhatsAppService.sendMessage(from, responseMessage);
        if (messageSent) {
          console.log(`✅ Mensagem enviada com sucesso para ${from}`);
        } else {
          console.error(`❌ Falha ao enviar mensagem para ${from}`);
        }
      } catch (error) {
        console.error(`💥 Erro ao enviar mensagem para ${from}:`, error);
      }
      
      // Log do evento
      await prisma.event.create({
        data: {
          userId: user.id,
          type: 'whatsapp_inbound',
          payload: {
            message: body,
            hasUrl: false,
            timestamp,
            pushName
          }
        }
      });
      
      return NextResponse.json({ success: true });
    }

    // Criar Property stub
    const property = await prisma.property.create({
      data: {
        sourceUrl: url,
        createdByUserId: user.id,
        status: 'PENDING',
        title: `Imóvel de ${pushName || phoneE164}`,
        parseAttempts: 0
      }
    });

    // Gerar shortId (primeiros 8 caracteres do ID)
    const shortId = property.id.substring(0, 8);

    // Responder com confirmação
    console.log(`📱 Enviando confirmação de URL recebida para ${from}`);
    try {
      const confirmationSent = await WhatsAppService.sendMessage(
        from,
        MessageTemplatesService.urlReceived(shortId)
      );
      
      if (confirmationSent) {
        console.log(`✅ Confirmação enviada com sucesso para ${from} - Property ID: ${property.id}`);
      } else {
        console.error(`❌ Falha ao enviar confirmação para ${from} - Property ID: ${property.id}`);
      }
    } catch (error) {
      console.error(`💥 Erro ao enviar confirmação para ${from}:`, error);
    }

    // Log do evento
    await prisma.event.create({
      data: {
        userId: user.id,
        type: 'whatsapp_inbound',
        payload: {
          message: body,
          hasUrl: true,
          url,
          propertyId: property.id,
          shortId,
          timestamp,
          pushName
        }
      }
    });

    
    // Processar imóvel em background (não aguardar)
    console.log(`🚀 Iniciando processamento em background para Property ${property.id}`);
    PropertyService.processProperty(property.id).catch((error: Error) => {
      console.error(`💥 Erro crítico no parsing em background para Property ${property.id}:`, error);
    });
    
    console.log(`🏠 Property criada com sucesso: ${property.id} para URL: ${url}`);

    console.log('=== FIM DO WEBHOOK ===\n');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('💥 ERRO CRÍTICO NO WEBHOOK:', error);
    console.error('📊 Dados da requisição:', {
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
      method: request.method
    });
    
    // Tentar logar o payload se possível
    try {
      const payload = await request.json();
      console.error('📄 Payload da requisição:', payload);
    } catch (payloadError) {
      console.error('❌ Não foi possível ler o payload da requisição:', payloadError);
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}