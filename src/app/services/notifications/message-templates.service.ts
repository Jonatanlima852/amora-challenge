/**
 * Templates centralizados para mensagens WhatsApp
 */
export class MessageTemplatesService {
  // TASK 2 - Notificações
  static parsingStarted(shortId: string): string {
    return `�� Analisando seu imóvel... ID: ${shortId}\nVou te avisar assim que terminar!`;
  }
  
  static parsingCompleted(score: number, reasons: string[], appUrl: string): string {
    return `�� **Seu Índice aMORA: ${score}/100**\n\n${reasons.join('\n')}\n\n📱 Ver no app: ${appUrl}`;
  }
  
  // TASK 3 - Respostas automáticas
  static urlReceived(shortId: string): string {
    return `✅ Link salvo! ID: ${shortId}\n🤖 Analisando características do imóvel com IA...`;
  }
  
  static noUrlFound(): string {
    return `❌ Não encontrei nenhum link na sua mensagem.\n\n�� Envie o link do anúncio do imóvel que deseja analisar!`;
  }
  
  static errorParsing(shortId: string): string {
    return `⚠️ Erro ao analisar o imóvel ${shortId}.\n�� Tentarei novamente em breve.`;
  }
  
  // Novos templates
  static welcomeMessage(): string {
    return `👋 Olá! Sou o assistente aMORA.\n\n�� Envie links de imóveis para eu analisar e calcular o Índice aMORA!`;
  }
  
  static helpMessage(): string {
    return `📚 **Como usar o aMORA:**\n\n1️⃣ Envie o link do anúncio do imóvel\n2️⃣ Aguarde minha análise\n3️⃣ Receba o Índice aMORA (0-100)\n4️⃣ Veja detalhes no app\n\n�� Dica: Funciona com QuintoAndar, VivaReal, OLX e outros!`;
  }
}
