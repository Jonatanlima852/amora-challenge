import { NextResponse } from 'next/server';
import { checkInstanceStatus } from '../../../../lib/evolution-whatsapp';

export async function GET() {
  try {
    const isConnected = await checkInstanceStatus();
    
    return NextResponse.json({
      status: 'ok',
      evolution_api: {
        connected: isConnected,
        instance: process.env.EVOLUTION_INSTANCE_NAME || 'amora-mvp-test',
        url: process.env.EVOLUTION_API_URL || 'http://localhost:8081'
      },
      message: isConnected 
        ? 'Evolution API está conectada e funcionando! 🚀'
        : 'Evolution API não está conectada. Verifique se está rodando em Docker.'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
