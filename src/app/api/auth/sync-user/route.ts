import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBrazilPhoneE164Candidates, normalizePhoneE164 } from '@/utils/common.utils';

export async function POST(request: NextRequest) {
  try {
    const { phone, shouldAssociate } = await request.json();
    
    // Obter dados do usuário do cookie de autenticação
    const authCookie = request.cookies.get('amora_auth')?.value;
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    let authData: { userId: string; role: string };
    try {
      authData = JSON.parse(authCookie);
    } catch {
      return NextResponse.json({ error: 'Cookie inválido' }, { status: 400 });
    }

    if (shouldAssociate) {
      // Buscar usuário existente por candidatos de telefone
      const candidates = getBrazilPhoneE164Candidates(phone);
      const e164ToStore = normalizePhoneE164(phone);

      const existingUser = await prisma.user.findFirst({
        where: { OR: candidates.map((c) => ({ phoneE164: c })) }
      });

      if (existingUser && existingUser.id !== authData.userId) {
        // Atualizar usuário existente com o ID atual
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            supabaseId: authData.userId,
            updatedAt: new Date()
          }
        });
      } else if (!existingUser) {
        // Atualizar usuário atual com o telefone
        await prisma.user.update({
          where: { id: authData.userId },
          data: {
            phoneE164: e164ToStore,
            updatedAt: new Date()
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
