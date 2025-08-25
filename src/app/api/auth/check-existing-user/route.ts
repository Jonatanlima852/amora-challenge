import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBrazilPhoneE164Candidates } from '@/utils/common.utils';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    const candidates = getBrazilPhoneE164Candidates(phone);

    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: candidates.map((c) => ({ phoneE164: c }))
      },
      select: {
        id: true,
        phoneE164: true,
        email: true,
        properties: {
          select: {
            id: true
          }
        }
      }
    });

    const exists = !!existingUser;
    const count = existingUser?.properties?.length || 0;
    
    if (existingUser) {
      console.log('🔍 check-existing-user: Usuário encontrado:', {
        id: existingUser.id,
        phoneE164: existingUser.phoneE164,
        email: existingUser.email,
        propertiesCount: count
      });
    }

    return NextResponse.json({
      exists,
      count
    });
  } catch (error) {
    console.error('❌ check-existing-user: Erro ao verificar usuário existente:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
