import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { normalizePhoneE164, extractFirstUrl } from '../../../../lib/whatsapp-utils';
import { sendWhatsAppMessage } from '../../../../lib/evolution-whatsapp';

const prisma = new PrismaClient();

// export async function POST(request: NextRequest) {
//   try {
//     // Validar API key
//     const apiKey = request.headers.get('apikey');
//     const expectedApiKey = process.env.EVOLUTION_API_KEY || 'amora_whatsapp_mvp_evolution_api_2024_secret_key';
    
//     if (apiKey !== expectedApiKey) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const payload = await request.json();
    
//     // Verificar se é evento de mensagem recebida
//     if (payload.event !== 'messages.upsert') {
//       return NextResponse.json({ success: true });
//     }

//     const message = payload.data.messages[0];
    
//     // Extrair dados da mensagem
//     const from = message.key.remoteJid; // formato: 5511999999999@s.whatsapp.net
//     const body = message.message?.conversation || 
//                  message.message?.extendedTextMessage?.text || 
//                  '';
//     const timestamp = message.messageTimestamp;

//     if (!from || !body) {
//       return NextResponse.json({ success: true });
//     }

//     // Normalizar telefone (remover @s.whatsapp.net)
//     const phoneE164 = normalizePhoneE164(from);
    
//     // Upsert usuário
//     const user = await prisma.user.upsert({
//       where: { phoneE164 },
//       create: { phoneE164 },
//       update: {}
//     });

//     // Extrair URL da mensagem
//     const url = extractFirstUrl(body);
    
//     if (!url) {
//       // Responder pedindo link
//       await sendWhatsAppMessage(
//         phoneE164,
//         "Recebi sua msg! Envie um link do imóvel para eu salvar 😊"
//       );
      
//       // Log do evento
//       await prisma.event.create({
//         data: {
//           userId: user.id,
//           type: 'whatsapp_inbound',
//           payload: {
//             message: body,
//             hasUrl: false,
//             timestamp
//           }
//         }
//       });
      
//       return NextResponse.json({ success: true });
//     }

//     // Criar Property stub
//     const property = await prisma.property.create({
//       data: {
//         sourceUrl: url,
//         createdByUserId: user.id,
//         status: 'PENDING',
//         title: `Imóvel de ${phoneE164}`,
//         parseAttempts: 0
//       }
//     });

//     // Gerar shortId (primeiros 8 caracteres do ID)
//     const shortId = property.id.substring(0, 8);

//     // Responder com confirmação
//     await sendWhatsAppMessage(
//       phoneE164,
//       `Salvei seu link ✅ Vou analisar e te aviso já já. ID: ${shortId}`
//     );

//     // Log do evento
//     await prisma.event.create({
//       data: {
//         userId: user.id,
//         type: 'whatsapp_inbound',
//         payload: {
//           message: body,
//           hasUrl: true,
//           url,
//           propertyId: property.id,
//           shortId,
//           timestamp
//         }
//       }
//     });

//     return NextResponse.json({ success: true });

//   } catch (error) {
//     console.error('Erro no webhook:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

export async function POST(request: NextRequest) {
  try {
    // Log de todos os headers recebidos
    console.log('=== WEBHOOK RECEBIDO ===');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    // Log do body completo
    const payload = await request.json();
    console.log('Body completo:', JSON.stringify(payload, null, 2));
    
    // Log específico dos dados da mensagem (se existir)
    if (payload.event === 'messages.upsert' && payload.data?.messages?.[0]) {
      const message = payload.data.messages[0];
      console.log('=== DADOS DA MENSAGEM ===');
      console.log('De:', message.key?.remoteJid);
      console.log('Tipo:', message.message ? Object.keys(message.message) : 'sem mensagem');
      console.log('Timestamp:', message.messageTimestamp);
      console.log('Push Name:', message.pushName);
    }
    
    console.log('=== FIM DO WEBHOOK ===\n');
    
    // Sempre retorna sucesso (não processa nada)
    return NextResponse.json({ success: true, debug: true });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}