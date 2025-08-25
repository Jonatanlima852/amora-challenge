import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação via cookie (mesmo padrão das outras rotas)
    const authCookie = request.cookies.get('amora_auth')?.value;
    
    if (!authCookie) {
      console.log('❌ API update-phone: Cookie não encontrado');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    let authData: { userId: string; role: string };
    try {
      authData = JSON.parse(authCookie);
      console.log('✅ API update-phone: Cookie parseado com sucesso:', authData);
    } catch (error) {
      console.error('❌ API update-phone: Erro ao parsear cookie:', error);
      return NextResponse.json({ error: 'Cookie inválido' }, { status: 400 });
    }

    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Telefone não fornecido' }, { status: 400 });
    }

    // Validar formato do telefone (apenas números)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json({ error: 'Formato de telefone inválido' }, { status: 400 });
    }

    console.log('📞 API update-phone: Atualizando telefone para usuário:', authData.userId);
    console.log('📞 API update-phone: Telefone:', cleanPhone);

    // Atualizar telefone na tabela public.users
    const updatedUser = await prisma.user.update({
      where: { id: authData.userId },
      data: { 
        phoneE164: cleanPhone,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        phoneE164: true,
        verified: true
      }
    });

    console.log('✅ API update-phone: Usuário atualizado com sucesso:', updatedUser);

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error) {
    console.error('❌ API update-phone: Erro ao atualizar telefone:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
