# aMORA - MVP WhatsApp para Imóveis

Uma plataforma inteligente para análise e gestão de imóveis com integração WhatsApp, desenvolvida em Next.js 15 e TypeScript.

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- PostgreSQL
- Redis

### 1. Configurar variáveis de ambiente
```bash
cp env.example .env
# Preencher as variáveis necessárias (Supabase, OpenAI, Evolution API)
```

### 2. Subir infraestrutura
```bash
cd evolution-api
docker-compose up -d
```

### 3. Instalar dependências e rodar
```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

---

## 🏠 Funcionalidades Implementadas

### **Sistema de Autenticação e Usuários**
- **Login via WhatsApp**: Autenticação por número de telefone com verificação por código SMS
- **Perfis de usuário**: Diferentes roles (USER, BROKER, ADMIN) com permissões específicas
- **Sincronização automática**: Usuários do WhatsApp são automaticamente sincronizados com o banco de dados

### **Gestão Inteligente de Imóveis**
- **Parser automático com IA**: Sistema que analisa URLs de imóveis usando OpenAI GPT-4 para extrair informações automaticamente
- **Suporte multi-plataforma**: Funciona com Zap Imóveis, Viva Real, OLX e outros sites
- **Sistema de scoring (Índice aMORA)**: Algoritmo que avalia imóveis de 0-100 baseado em:
  - Preço por m² (35% do score)
  - Custo mensal total (25%)
  - Aderência aos requisitos (20%)
  - Tempo de deslocamento (10%)
  - Liquidez do mercado (10%)

### **Colaboração em Grupos**
- **Households**: Sistema de grupos para famílias ou equipes compartilharem listas de imóveis
- **Convites e permissões**: Sistema de convites com diferentes níveis de acesso (OWNER, MEMBER)
- **Listas compartilhadas**: Cada grupo pode ter múltiplas listas de imóveis com notas e favoritos

### **Integração WhatsApp (Evolution API)**
- **Webhooks funcionais**: Recebe mensagens e eventos do WhatsApp em tempo real
- **Sincronização bidirecional**: Usuários podem interagir tanto pela web quanto pelo WhatsApp
- **Notificações automáticas**: Sistema de alertas para novos imóveis e atualizações

### **Dashboard Inteligente**
- **Visão geral personalizada**: Mostra propriedades recentes, grupos ativos e estatísticas
- **Comparação de imóveis**: Interface para analisar múltiplas propriedades lado a lado
- **Filtros avançados**: Busca por preço, localização, características e score

---

## 🏗️ Arquitetura e Organização do Código

### **Estrutura de Pastas**
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Endpoints da API
│   │   ├── properties/    # CRUD de imóveis
│   │   ├── groups/        # Gestão de grupos
│   │   ├── auth/          # Autenticação
│   │   └── webhooks/      # Webhooks WhatsApp
│   ├── app/               # Área autenticada
│   │   ├── properties/    # Páginas de imóveis
│   │   ├── groups/        # Gestão de grupos
│   │   └── profile/       # Perfil do usuário
│   └── (public)/          # Páginas públicas
├── components/             # Componentes React reutilizáveis
├── services/               # Lógica de negócio
│   ├── property/          # Serviços de imóveis
│   ├── parsing/           # Parser com IA
│   └── sync-whatsapp/     # Integração WhatsApp
├── types/                  # Definições TypeScript
├── lib/                    # Utilitários e configurações
└── contexts/               # Contextos React (Auth, etc.)
```

### **Tecnologias Principais**
- **Frontend**: Usei Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Usei a API Routes do Next.js, Prisma ORM
- **Banco**: Usei PostgreSQL com Prisma, mas usei como banco postgreSQL o banco fornecido pelo supabase. Poderia subir um banco postgres local, mas para ficar mais fácil de observar os dados e por se tratar de um MVP preferi esta abordagem.
- **Autenticação**: Usei uma mistura de Supabase Auth com alguns fluxos próprios
- **IA**: OpenAI GPT-4 para parsing de imóveis
- **WhatsApp**: Usei um Evolution API (self-hosted na AWS ou no docker local) pois era a mais confiável e gratuita que encontrei que me possibilitasse a integração com whatsapp

### **Padrões de Código**
- **Arquitetura em camadas**: Separação clara entre API, serviços e componentes
- **TypeScript rigoroso**: Tipos bem definidos para todas as entidades
- **Serviços modulares**: Cada funcionalidade tem seu próprio serviço
- **Tratamento de erros**: Sistema robusto de fallbacks e tratamento de exceções
- **Componentes reutilizáveis**: UI components baseados em Radix UI

### **Sistema de Parsing**
- **Parser principal com IA**: Usa GPT-4 para extrair dados de qualquer site de imóveis
- **Fallback inteligente**: Sistema de backup quando a IA falha
- **Configuração flexível**: Timeouts, retries e user agents configuráveis
- **Tratamento SSL**: Suporte para diferentes configurações de certificados

### **Banco de Dados**
- **Schema relacional**: Usuários, imóveis, grupos e relacionamentos bem definidos
- **Migrations automáticas**: Sistema de versionamento do banco com Prisma
- **Índices otimizados**: Performance otimizada para consultas frequentes
- **Relacionamentos complexos**: Suporte para membros de grupos, listas e favoritos

### **Segurança e Performance**
- **Middleware de autenticação**: Proteção de rotas autenticadas
- **Validação de dados**: Zod para validação de schemas
- **Rate limiting**: Proteção contra abuso da API
- **Cache inteligente**: Redis para dados frequentemente acessados
- **Lazy loading**: Carregamento sob demanda de componentes pesados

Esta plataforma representa um MVP robusto e escalável para gestão de imóveis com integração WhatsApp, demonstrando boas práticas de desenvolvimento e arquitetura moderna.
