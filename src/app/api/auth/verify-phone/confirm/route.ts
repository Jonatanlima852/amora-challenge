import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhoneE164, getBrazilPhoneE164Candidates } from '@/utils/common.utils';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();
    
    if (!phone || !code) {
      return NextResponse.json({ error: 'Telefone e código são obrigatórios' }, { status: 400 });
    }

    const phoneE164 = normalizePhoneE164(phone);
    
    console.log('🔐 API confirm: Verificando código para telefone:', phoneE164);
    console.log('🔐 API confirm: Código recebido:', code);
    
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
      console.log('❌ API confirm: Código inválido ou expirado');
      return NextResponse.json({ error: 'Código inválido ou expirado' }, { status: 400 });
    }

    console.log('✅ API confirm: Verificação encontrada, verificando tentativas...');

    // Verificar limite de tentativas
    if (verification.attempts >= 3) {
      console.log('❌ API confirm: Muitas tentativas, bloqueando');
      return NextResponse.json({ error: 'Muitas tentativas. Solicite um novo código' }, { status: 429 });
    }

    // Incrementar tentativas
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { attempts: verification.attempts + 1 }
    });

    console.log('✅ API confirm: Tentativas incrementadas, marcando como verificado...');

    // Marcar como verificado
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    });

    console.log('✅ API confirm: Verificação marcada como true, atualizando usuário...');

    // Buscar usuário usando candidatos de telefone para garantir match
    const phoneCandidates = getBrazilPhoneE164Candidates(phone);
    console.log('🔍 API confirm: Buscando usuário com candidatos:', phoneCandidates);
    
    const user = await prisma.user.findFirst({
      where: {
        OR: phoneCandidates.map((candidate) => ({ phoneE164: candidate }))
      }
    });

    if (user) {
      console.log('✅ API confirm: Usuário encontrado, atualizando campo verified...');
      console.log('✅ API confirm: Usuário ID:', user.id, 'Telefone armazenado:', user.phoneE164);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          verified: true,
          updatedAt: new Date()
        }
      });
      console.log('✅ API confirm: Usuário atualizado com sucesso, ID:', user.id);
    } else {
      console.log('⚠️ API confirm: Usuário não encontrado para telefone:', phoneE164);
      console.log('⚠️ API confirm: Candidatos testados:', phoneCandidates);
    }

    console.log('✅ API confirm: Verificação concluída com sucesso');

    return NextResponse.json({ 
      success: true, 
      message: 'Telefone verificado com sucesso',
      verified: true
    });

  } catch (error) {
    console.error('❌ API confirm: Erro ao confirmar verificação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
