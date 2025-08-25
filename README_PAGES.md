# aMORA WhatsApp MVP — Estrutura de Páginas, Rotas e Fluxos

## Visão de Produto (MVP)

- **Objetivo 1**: capturar imóveis por WhatsApp, salvar e ranquear (Índice aMORA), listar e **comparar**.
- **Objetivo 2**: reengajar leads com **busca semanal** de similares (cron) e envio por WhatsApp.
- **Objetivo 3**: **colaboração em grupos** (leads + corretores), com comentários e reações.
- **Objetivo 4**: dar ao **corretor** uma página pública bonita (slug), com **imóveis em destaque** e CTA para WhatsApp.
- **Objetivo 5**: **viralizar** sem custo de mídia: site leve, bot usável sem login (limites), ferramenta pública de **comparação de até 5 URLs**.

---

## Mapa de Rotas (Next.js)

### Público (sem login)
- `/` — Landing aMORA
- `/compare` — Comparação pública (até 5 URLs)
- `/c/:slug` — Página pública do corretor
- `/p/:propertyId` — Ficha pública enxuta (opcional)

### Cliente (autenticado)
- `/app` — Home do cliente
- `/app/properties` — Lista de imóveis
- `/app/properties/:id` — Detalhe do imóvel
- `/app/compare` — Comparação
- `/app/groups` — Meus grupos
- `/app/groups/:groupId` — Sala do grupo
- `/app/profile` — Preferências

### Corretor (autenticado)
- `/corretor` — Dashboard
- `/corretor/properties` — Meus imóveis
- `/corretor/properties/new` — Cadastro rápido
- `/corretor/groups` — Grupos
- `/corretor/page` — Página pública
- `/corretor/contacts` — Leads



---## UX & Telas

### 1. Landing `/`
- Headline + CTA WhatsApp
- Passos: Envie link → Receba insights → Compare no app
- Demo de comparação (até 5 links)
- Mini cards de “corretores parceiros”

### 2. Compare público `/compare`
- Inputs de até 5 URLs
- Tabela de comparação (Preço, m², condomínio, bairro, Índice aMORA)
- Resumo IA com Prós/Contras
- CTA “Salvar no aMORA”

### 3. Página do corretor `/c/:slug`
- Header com foto, nome, bio, CTA WhatsApp
- Carrossel/grid de imóveis em destaque
- Botão para exportar card PNG (CTA + QR)

### 4. Home do cliente `/home`
- Alertas: “Último imóvel salvo” / “Novos similares”
- Cards: recentes, recomendados, grupos ativos
- CTA para comparação rápida

### 5. Lista `/home/properties`
- Filtros: preço, m², bairro, tipo, vagas
- Cards com chips + Índice aMORA

### 6. Detalhe `/home/properties/:id`
- Galeria, preço, atributos
- Índice aMORA + explicabilidade
- Resumo IA
- Similares
- Ações: comparar, favoritar, grupo

### 7. Comparação `/home/compare`
- Tabela até 4 imóveis
- Destaque automático de melhor custo-benefício
- Resumo IA “Para quem busca X, melhor opção é Y”

### 8. Grupos `/home/groups`
- Lista de grupos
- Feed tipo chat (eventos + comentários + reações)
- Link de convite

### 9. Perfil `/home/profile`
- Preferências do lead
- Opt-in/out da rotina semanal
- Associação ao WhatsApp

### 10. Corretor
- **Dashboard**: KPIs de leads, grupos
- **Página pública**: editar slug, bio, destaques, gerar PNG
- **Propriedades**: cadastrar por URL
- **Contatos**: leads + opção de reativar


---
## APIs & Webhooks

- **WhatsApp Inbound**: `/api/webhooks/evolution`
- **Parsing**: `/api/properties/:id/parse`
- **Similaridade (cron)**: `/jobs/similar-weekly`
- **Grupos**: `/api/groups`, `/api/groups/join`, `/api/groups/:id/comment`
- **Compare público**: `/api/compare/public`
- **Corretor**: `/api/broker/page`, `/api/broker/highlights`

---

## Fluxos Críticos (MVP)

### Captura por WhatsApp
User envia link → webhook cria stub → responde **“processando”** → parsing → score → envia mensagem final com **link do app**.

### Comparação
Selecionar no app ou pedir no WhatsApp → **/app/compare**.

### Grupo
Criar grupo → gerar link → usuários entram → **feed colaborativo** (eventos + comentários + reações).

### Corretor share
Página pública (`/c/:slug`) + **export PNG** → **viralização**.

---

## Templates WhatsApp (exemplos)

**Recebido link**  
“Salvei seu imóvel ✅ Analisando agora, já te aviso. Veja no app: `<link>`”

**Análise pronta**  
“Índice aMORA: *78/100* | Prós: área acima da média | Contras: condomínio alto. Ver: `<link>`”

**Reengajamento (semanal)**  
“Encontrei 4 opções no seu perfil 💡 Quer adicionar alguma? [Adicionar] [Pular]”

---

## Roadmap (ordem sugerida)

1. Webhook + parsing stub  
2. Parsing & Score  
3. App cliente (home, listagem, detalhe, comparação)  
4. Grupos básicos  
5. Página pública corretor  
6. Comparação pública  
7. Cron semanal (reengajamento)  
8. Admin básico

---

## Anti-abuso na comparação sem login

- **Rate limit (Redis)**: máx. **8/dia/IP**, **2/min/IP**  
- **reCAPTCHA invisível**  
- **Shadow save** para incentivar login (salvar as últimas comparações e pedir login para persistir)
