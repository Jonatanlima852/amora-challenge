import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhoneE164 } from '@/utils/common.utils';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();
    
    if (!phone || !code) {
      return NextResponse.json({ error: 'Telefone e código são obrigatórios' }, { status: 400 });
    }

    const phoneE164 = normalizePhoneE164(phone);
    
    // Buscar verificação válida
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        phoneE164,
        code,
        verified: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!verification) {
      return NextResponse.json({ error: 'Código inválido ou expirado' }, { status: 400 });
    }

    // Verificar limite de tentativas
    if (verification.attempts >= 3) {
      return NextResponse.json({ error: 'Muitas tentativas. Solicite um novo código' }, { status: 429 });
    }

    // Incrementar tentativas
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { attempts: verification.attempts + 1 }
    });

    // Marcar como verificado
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    });

    // Atualizar usuário no banco (se existir)
    const user = await prisma.user.findFirst({
      where: { phoneE164 }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { verified: true }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Telefone verificado com sucesso',
      verified: true
    });

  } catch (error) {
    console.error('Erro ao confirmar verificação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
