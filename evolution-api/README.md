# Documentação - Evolution API v2

## 📋 O que é?

O **Evolution API v2** é uma implementação open-source da WhatsApp Business API que permite o seguinte:
- ✅ **Enviar e receber mensagens** do WhatsApp
- ✅ **Webhooks funcionais** para captar eventos do whatsapp

## 🎯 **Vantagens do Evolution API para o MVP:**
- ✅ **Totalmente gratuito** e self-hosted (Principal - será deployado utilizando docker)
- ✅ **Interface web** para gerenciar conexões
- ✅ **Self-hosted** - controle total sobre os dados

## 🐳 Como subir a Evolution API e demais dependências com Docker

### **1) Pré-requisitos**
- Docker e Docker Compose instalados
- Portas 8080, 5432 e 6379 disponíveis

### **2) Subir toda a infraestrutura**
```bash
# Na pasta evolution-api/
docker-compose up -d
```

**💡 Isso vai subir:**
- ✅ **PostgreSQL** na porta 5432
- ✅ **Redis** na porta 6379  
- ✅ **Evolution API** na porta 8080

### **3) Verificar se tudo subiu e os logs de cada conteiner**
```bash
# Ver status dos containers
docker-compose ps

# Ver logs da API
docker-compose logs -f evolution-api

# Ver logs do banco
docker-compose logs -f postgres

# Ver logs do Redis
docker-compose logs -f redis

# Parar tudo
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### **4) Acessar a interface web**
```
http://localhost:8080
```


## 🔧 **Passos após subir com docker:**

1. **Configurar o .env** com suas chaves
2. **Subir o Docker Compose**
3. **Criar instância** no Evolution API
4. **Conectar seu WhatsApp** para teste
5. **Implementar webhooks** para serem utilizados no projeto

## 🔗 Configuração do Webhook

### **1) Criar instância**
1. Acesse `http://localhost:8080`
2. Clique em **"Create Instance"**
3. Preencha:
   - **Instance Name**: `amora-mvp`
   - **Webhook URL**: `http://localhost:3000/api/webhooks/evolution`
   - **Webhook Events**: Marque todos (message, connection, etc.)

### **2) Conectar WhatsApp**
1. Na instância criada, clique em **"Connect"**
2. Escaneie o QR Code com seu WhatsApp
3. Aguarde a conexão ser estabelecida


## 🔧 Integração com o Projeto aMORA

### **1) Exemplo de endpoint do webhook**
```typescript
// src/app/api/webhooks/evolution/route.ts
export async function POST(request: Request) {
  const payload = await request.json();
  
  // Evolution API envia diferentes tipos de eventos
  if (payload.event === 'messages.upsert') {
    const message = payload.data.messages[0];
    
    // Processar mensagem recebida
    await processWhatsAppMessage({
      from: message.key.remoteJid,
      body: message.message?.conversation || message.message?.extendedTextMessage?.text,
      timestamp: message.messageTimestamp
    });
  }
  
  return Response.json({ success: true });
}
```

### **2) Serviço para enviar mensagens**
```typescript
// src/lib/evolution-whatsapp.ts
export async function sendWhatsAppMessage(
  instanceName: string, 
  to: string, 
  body: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `http://localhost:8080/instance/${instanceName}/sendText/${to}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.EVOLUTION_API_KEY || 'amora_whatsapp_mvp_evolution_api_2024_secret_key'
        },
        body: JSON.stringify({ text: body })
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return false;
  }
}
```

##  Tipos de Mensagens Suportadas

### Texto
```typescript
await sendWhatsAppMessage('amora-mvp', '5511999999999', 'Olá! Seu imóvel foi analisado.');
```

### Mídia (fotos, documentos)
```typescript
// Enviar foto
await fetch(`http://localhost:8080/instance/amora-mvp/sendMedia/5511999999999`, {
  method: 'POST',
  headers: { 'apikey': 'sua_chave' },
  body: JSON.stringify({
    mediaMessage: {
      mimetype: 'image/jpeg',
      data: 'base64_da_imagem'
    }
  })
});
```

 **Obs:** a rota de webhook com localhost não consegue ser acessada de dentro do container. O correto é utilizar o IP na rede. Além disso, tem-se que pensar na estratégia de deploy, pois não irá reconhecer a rota de API do webhook com IP da rede que o Next fornece. Vamos ter que deployar o next também. 

## 🚨 Limitações e Cuidados

### ⚠️ **Importante:**
- **Não usar o número pessoal em produção**
- **WhatsApp pode detectar uso não comercial ou spam**
- **Para produção, é melhor usar Meta Business API oficial**

### 🔒 **Segurança:**
- **Mantenha a API_KEY secreta**
- **Não exponha a porta 8080 publicamente**


## 📚 Recursos Adicionais

- **Documentação oficial**: [Evolution API Docs](https://doc.evolution-api.com/)
- **Exemplos**: [GitHub Evolution API](https://github.com/EvolutionAPI/evolution-api)
