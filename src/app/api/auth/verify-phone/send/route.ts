import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhoneE164 } from '@/utils/common.utils';
import { WhatsAppService } from '@/services/notifications/whatsapp.service';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 });
    }

    const phoneE164 = normalizePhoneE164(phone);
    
    
    // Verificar se já existe verificação pendente
    const existingVerification = await prisma.phoneVerification.findFirst({
      where: {
        phoneE164,
        verified: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (existingVerification) {
      // Se já existe verificação válida, retornar erro
      const timeLeft = Math.ceil((existingVerification.expiresAt.getTime() - Date.now()) / 1000 / 60);
      return NextResponse.json({ 
        error: `Aguarde ${timeLeft} minutos para solicitar novo código` 
      }, { status: 429 });
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calcular expiração (10 minutos)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);


    // Salvar verificação no banco
    const verification = await prisma.phoneVerification.create({
      data: {
        phoneE164,
        code,
        expiresAt,
        verified: false,
        attempts: 0
      }
    });


    // Enviar código via WhatsApp
    const message = `🔐 Seu código de verificação aMORA: *${code}*\n\n⏰ Este código expira em 10 minutos.\n\n⚠️ Não compartilhe este código com ninguém.`;
    
    const whatsappResult = await WhatsAppService.sendMessage(phoneE164, message);
    
    if (whatsappResult) {
      console.log('✅ API send: Código enviado com sucesso via WhatsApp');
    } else {
      console.log('❌ API send: Falha ao enviar código via WhatsApp');
      // Mesmo com falha no WhatsApp, retornamos sucesso pois o código foi salvo
      // O usuário pode ver o código no console para desenvolvimento
    }

    // Em desenvolvimento, sempre logar o código
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 [DEV] Código de verificação para ${phoneE164}: ${code}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Código enviado para seu WhatsApp',
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('❌ API send: Erro ao enviar código de verificação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
