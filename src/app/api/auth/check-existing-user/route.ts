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
        properties: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json({
      exists: !!existingUser,
      count: existingUser?.properties?.length || 0
    });
  } catch (error) {
    console.error('Erro ao verificar usuário existente:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
