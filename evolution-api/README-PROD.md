# Deploy Simples AWS - Evolution API

## 🎯 **Resumo**
Deploy da Evolution API na AWS usando **EC2 t2.micro + Docker Compose**. Tudo rodando em uma única máquina, **custo zero** por 12 meses.

## **Custos**
- **EC2 t2.micro**: $0/mês (Free Tier)
- **Total**: **$0/mês** por 12 meses

## **Pré-requisitos**
- Conta AWS com Free Tier ativo
- AWS CLI configurado
- Chave SSH para EC2

## 🌐 **Deploy pela Interface Web da AWS (Recomendado)**

### **1. Criar Key Pair (Chave SSH)**
1. Acesse [AWS Console](https://console.aws.amazon.com/)
2. Vá para **EC2** → **Key Pairs**
3. Clique em **Create Key Pair**
4. Nome: `evolution-api-key`
5. Tipo: **RSA**
6. Formato: **.pem**
7. Clique **Create Key Pair**
8. **Baixe o arquivo .pem** (você só pode baixar uma vez!)

### **2. Criar VPC (Virtual Private Cloud)**
1. Vá para **VPC** → **Your VPCs**
2. Clique em **Create VPC**
3. **VPC settings:**
   - Name tag: `evolution-api-vpc`
   - IPv4 CIDR: **10.0.0.0/16** (deixe padrão)
   - IPv6 CIDR: **No IPv6 CIDR block**
4. **Tags:**
   - Key: `Name`, Value: `evolution-api-vpc`
5. Clique **Create VPC**

### **3. Criar Subnet**
1. Vá para **VPC** → **Subnets**
2. Clique em **Create Subnet**
3. **Subnet settings:**
   - VPC ID: **evolution-api-vpc** (selecione a que criou)
   - Subnet name: `evolution-api-subnet`
   - Availability Zone: **us-east-1a** (ou a primeira disponível)
   - IPv4 CIDR: **10.0.1.0/24** (deixe padrão)
4. Clique **Create Subnet**

### **4. Criar Internet Gateway**
1. Vá para **VPC** → **Internet Gateways**
2. Clique em **Create Internet Gateway**
3. **Name tag:** `evolution-api-igw`
4. Clique **Create Internet Gateway**
5. **Anexar à VPC:**
   - Selecione o Internet Gateway criado
   - Clique **Actions** → **Attach to VPC**
   - VPC: **evolution-api-vpc**
   - Clique **Attach Internet Gateway**

### **5. Configurar Route Table**
1. Vá para **VPC** → **Route Tables**
2. Selecione a route table da sua VPC
3. Clique em **Edit routes**
4. Clique **Add route**
5. **Route settings:**
   - Destination: **0.0.0.0/0**
   - Target: **Internet Gateway** → **evolution-api-igw**
6. Clique **Save changes**

### **6. Criar Security Group**
1. Vá para **EC2** → **Security Groups**
2. Clique em **Create Security Group**
3. **Basic details:**
   - Security group name: `evolution-api-sg`
   - Description: `Security group para Evolution API`
   - **VPC: evolution-api-vpc** (IMPORTANTE: selecione a VPC que criou)
4. **Inbound rules:**
   - Clique **Add rule**
   - Type: **SSH**, Port: **22**, Source: **0.0.0.0/0**
   - Clique **Add rule**
   - Type: **Custom TCP**, Port: **8080**, Source: **0.0.0.0/0**
   - Clique **Add rule**
   - Type: **HTTP**, Port: **80**, Source: **0.0.0.0/0**
5. **Outbound rules:** Deixe padrão (All traffic)
6. Clique **Create Security Group**

### **7. Criar EC2 Instance**
1. Vá para **EC2** → **Instances**
2. Clique em **Launch Instances**
3. **Name and tags:**
   - Name: `evolution-api`
4. **Application and OS Images:**
   - Quick Start: **Ubuntu**
   - Version: **22.04 LTS**
5. **Instance type:**
   - **t2.micro** (Free tier eligible)
6. **Key pair:**
   - Select existing key pair: **evolution-api-key**
7. **Network settings:**
   - **VPC: evolution-api-vpc** (IMPORTANTE: selecione a VPC que criou)
   - **Subnet: evolution-api-subnet** (IMPORTANTE: selecione a subnet que criou)
   - Security group: **evolution-api-sg**
8. **Configure storage:**
   - Size: **8 GiB** (Free tier)
9. **Advanced details:**
   - User data (opcional):
   ```bash
   #!/bin/bash
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo usermod -aG docker ubuntu
   ```
10. Clique **Launch Instance**

### **4. Conectar na EC2**
1. **Aguardar** a instância ficar "Running"
2. **Anotar o IP público** da instância
3. **Conectar via SSH:**
   ```bash
   # No seu computador
   ssh -i evolution-api-key.pem ubuntu@IP_DA_EC2
   ```

### **5. Instalar Docker (se não usou User Data)**
```bash
# Na EC2
sudo apt update
sudo apt install -y docker.io docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker ubuntu
newgrp docker

# Verificar instalação
docker --version
docker-compose --version
```

### **6. Configurar Evolution API**
```bash
# Na EC2, criar pasta do projeto
mkdir evolution-api && cd evolution-api

# Criar docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.9'
services:
  # PostgreSQL Database
  postgres:
    container_name: evolution_postgres
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: evolution
      POSTGRES_USER: evolution_user
      POSTGRES_PASSWORD: evolution_pass_2024
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U evolution_user -d evolution"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    container_name: evolution_redis
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Evolution API
  evolution-api:
    container_name: evolution_api
    image: atendai/evolution-api:v2.1.1
    restart: always
    ports:
      - "8080:8080"
    env_file:
      - .env
    volumes:
      - evolution_instances:/evolution/instances
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  evolution_instances:
EOF
```

Copie também o seu .env para o repositório. Use o .env.example fornecido no repositório:

```bash
cat > .env << 'EOF'
# Autenticação
AUTHENTICATION_API_KEY=sua_secret_key

QRCODE_LIMIT=30

CONFIG_SESSION_PHONE_VERSION = 2.3000.1024363850

# Banco de Dados PostgreSQL
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://user:pass@postgres:5432/evolution?schema=public
DATABASE_CONNECTION_CLIENT_NAME=evolution_exchange

# Dados a serem salvos no banco
DATABASE_SAVE_DATA_INSTANCE=true
DATABASE_SAVE_DATA_NEW_MESSAGE=true
DATABASE_SAVE_MESSAGE_UPDATE=true
DATABASE_SAVE_DATA_CONTACTS=true
DATABASE_SAVE_DATA_CHATS=true
DATABASE_SAVE_DATA_LABELS=true
DATABASE_SAVE_DATA_HISTORIC=true

# Cache Redis
CACHE_REDIS_ENABLED=true
CACHE_REDIS_URI=redis://redis:6379/6
CACHE_REDIS_PREFIX_KEY=amora_evolution
CACHE_REDIS_SAVE_INSTANCES=false
CACHE_LOCAL_ENABLED=false

# CORS para desenvolvimento
CORS_ENABLED=true
CORS_ORIGIN=*

# Logs
LOGGER_ENABLED=true
LOGGER_LEVEL=ERROR
LOGGER_COLOR=true
```

### **7. Subir a API**
```bash
# Na EC2, subir tudo
docker-compose up -d

# Ver logs
docker-compose logs -f evolution-api

# Ver status
docker-compose ps
```

### **8. Testar a API**
1. **No seu navegador:** `http://IP_DA_EC2:8080`
2. **Deve aparecer** a interface da Evolution API
3. **Criar instância** com nome `amora-mvp`
4. **Configurar webhook:** `http://IP_DA_EC2:8080/api/webhooks/evolution`

## 🖥️ **Deploy via AWS CLI (Alternativo)**

### **1. Criar EC2 Instance**
```bash
# Criar instância t2.micro
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t2.micro \
  --key-name sua-chave-ssh \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=evolution-api}]'
```

### **2. Configurar Security Group**
```bash
# Criar security group
aws ec2 create-security-group \
  --group-name evolution-api-sg \
  --description "Security group para Evolution API"

# Liberar portas
aws ec2 authorize-security-group-ingress \
  --group-name evolution-api-sg \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name evolution-api-sg \
  --protocol tcp \
  --port 8080 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name evolution-api-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0
```

##  **Acessar a API**
- **URL**: `http://IP_DA_EC2:8080`
- **Webhook**: `http://IP_DA_EC2:8080/api/webhooks/evolution`
- **Interface Web**: `http://IP_DA_EC2:8080`

## 🔧 **Comandos Úteis**
```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f evolution-api
docker-compose logs -f postgres
docker-compose logs -f redis

# Reiniciar um serviço
docker-compose restart evolution-api

# Parar tudo
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Ver uso de recursos
docker stats

# Ver status dos containers
docker-compose ps
```

## 📊 **Monitoramento Básico**
```bash
# Ver uso de CPU e RAM
htop

# Ver uso de disco
df -h

# Ver logs do sistema
sudo journalctl -f

# Ver portas em uso
sudo netstat -tlnp
```

## 🔄 **Deploy Automático (Opcional)**
```bash
# Criar script de deploy
cat > deploy.sh << 'EOF'
#!/bin/bash
cd /home/ubuntu/evolution-api
git pull origin main
docker-compose down
docker-compose up -d --build
echo "Deploy concluído em $(date)"
EOF

chmod +x deploy.sh

# Executar via cron (a cada 5 minutos)
echo "*/5 * * * * /home/ubuntu/evolution-api/deploy.sh" | crontab -
```

## 🚨 **Limitações t2.micro**
- **1 vCPU, 1GB RAM** - suficiente para MVP
- **Ideal para desenvolvimento** e testes
- **Pode ficar lento** com muito tráfego

## 💡 **Dicas de Otimização**
1. **Usar swap** se precisar de mais RAM
2. **Monitorar uso** para não exceder Free Tier
3. **Backup automático** dos volumes Docker
4. **Logs rotacionados** para economizar espaço

## 🔒 **Segurança**
```bash
# Mudar senha padrão do PostgreSQL
# Mudar API_KEY padrão
# Configurar firewall (Security Group)
# Usar HTTPS com proxy reverso (opcional)
```

## 📝 **Resumo das mudanças:**

Adicionei **duas seções colapsáveis** ao final do README:

### **1. 🖥️ Deploy via AWS CLI (Alternativo)**
- **Colapsável** usando `<details>` e `<summary>`
- **Comandos completos** para quem prefere CLI
- **Inclui criação de VPC** via linha de comando

### **2. 🗑️ Como Excluir Todos os Recursos**
- **Colapsável** para não poluir o README
- **Passo a passo visual** pela interface web
- **Comandos CLI** para limpeza em lote
- **Ordem correta** de exclusão (dependências primeiro)
- **Verificação** de limpeza completa

##  **Vantagens das seções colapsáveis:**

- ✅ **README mais limpo** e organizado
- ✅ **Informações avançadas** disponíveis quando necessário
- ✅ **Foco na interface web** (mais amigável)
- ✅ **CLI e limpeza** acessíveis mas não intrusivos

Agora o README está completo com todas as opções e a limpeza dos recursos! Quer que eu ajuste mais alguma coisa?

## 🎯 **Próximos Passos**
1. **Criar conta AWS** e ativar Free Tier
2. **Seguir passos da interface web** (mais fácil)
3. **Testar API** em produção
4. **Configurar domínio** (opcional)

## 🔗 **Links Úteis**
- [AWS Free Tier](https://aws.amazon.com/free/)
- [EC2 Pricing](https://aws.amazon.com/ec2/pricing/)
- [Docker Compose](https://docs.docker.com/compose/)
- [AWS Console](https://console.aws.amazon.com/)

---

**✅ Resultado**: Evolution API rodando na AWS com custo zero por 12 meses!

**🎯 Vantagens desta abordagem:**
- ✅ **Mais simples** de configurar
- ✅ **Custo zero** (Free Tier)
- ✅ **Tudo em uma máquina** (mais fácil de gerenciar)
- ✅ **Docker Compose** (igual ao ambiente local)
- ✅ **Escalável** (pode migrar para RDS/ElastiCache depois)

**🌐 Interface Web vs CLI:**
- **Interface Web**: ✅ Mais visual e intuitiva
- **AWS CLI**: ✅ Mais rápida para quem já conhece
- **Recomendação**: Comece pela interface web!

---

## 🖥️ **Deploy via AWS CLI (Alternativo)**

<details>
<summary><strong> Clique para expandir - Deploy via linha de comando</strong></summary>

### **1. Criar EC2 Instance**
```bash
# Criar instância t2.micro
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t2.micro \
  --key-name sua-chave-ssh \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=evolution-api}]'
```

### **2. Configurar Security Group**
```bash
# Criar security group
aws ec2 create-security-group \
  --group-name evolution-api-sg \
  --description "Security group para Evolution API"

# Liberar portas
aws ec2 authorize-security-group-ingress \
  --group-name evolution-api-sg \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name evolution-api-sg \
  --protocol tcp \
  --port 8080 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name evolution-api-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0
```

### **3. Criar VPC e Subnet via CLI**
```bash
# Criar VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=evolution-api-vpc}]'

# Criar Subnet
aws ec2 create-subnet \
  --vpc-id vpc-xxxxxxxxx \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=evolution-api-subnet}]'

# Criar Internet Gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=evolution-api-igw}]'

# Anexar Internet Gateway à VPC
aws ec2 attach-internet-gateway \
  --vpc-id vpc-xxxxxxxxx \
  --internet-gateway-id igw-xxxxxxxxx
```

</details>

---

## 🗑️ **Como Excluir Todos os Recursos**

<details>
<summary><strong> Clique para expandir - Limpeza completa da AWS</strong></summary>

### **⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!**
Todos os dados serão perdidos permanentemente.

### **1. Excluir EC2 Instance**
1. Vá para **EC2** → **Instances**
2. Selecione a instância `evolution-api`
3. Clique **Instance state** → **Terminate instance**
4. Confirme a exclusão

### **2. Excluir Security Group**
1. Vá para **EC2** → **Security Groups**
2. Selecione `evolution-api-sg`
3. Clique **Actions** → **Delete security group**
4. Confirme a exclusão

### **3. Excluir Subnet**
1. Vá para **VPC** → **Subnets**
2. Selecione `evolution-api-subnet`
3. Clique **Actions** → **Delete subnet**
4. Confirme a exclusão

### **4. Desanexar e Excluir Internet Gateway**
1. Vá para **VPC** → **Internet Gateways**
2. Selecione `evolution-api-igw`
3. Clique **Actions** → **Detach from VPC**
4. Depois clique **Actions** → **Delete internet gateway**
5. Confirme a exclusão

### **5. Excluir VPC**
1. Vá para **VPC** → **Your VPCs**
2. Selecione `evolution-api-vpc`
3. Clique **Actions** → **Delete VPC**
4. Confirme a exclusão

### **6. Excluir Key Pair**
1. Vá para **EC2** → **Key Pairs**
2. Selecione `evolution-api-key`
3. Clique **Actions** → **Delete key pair**
4. Confirme a exclusão

### **7. Limpeza via AWS CLI (Alternativo)**
```bash
# Obter IDs dos recursos
aws ec2 describe-instances --filters "Name=tag:Name,Values=evolution-api" --query 'Reservations[].Instances[].InstanceId' --output text
aws ec2 describe-security-groups --filters "Name=group-name,Values=evolution-api-sg" --query 'SecurityGroups[].GroupId' --output text
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=evolution-api-vpc" --query 'Vpcs[].VpcId' --output text

# Excluir recursos (substitua os IDs)
aws ec2 terminate-instances --instance-ids i-xxxxxxxxx
aws ec2 delete-security-group --group-id sg-xxxxxxxxx
aws ec2 delete-subnet --subnet-id subnet-xxxxxxxxx
aws ec2 delete-internet-gateway --internet-gateway-id igw-xxxxxxxxx
aws ec2 delete-vpc --vpc-id vpc-xxxxxxxxx
aws ec2 delete-key-pair --key-name evolution-api-key
```

### **8. Verificar Limpeza**
1. **EC2**: Nenhuma instância deve aparecer
2. **Security Groups**: Nenhum grupo deve aparecer
3. **VPC**: Nenhuma VPC deve aparecer
4. **Subnets**: Nenhuma subnet deve aparecer
5. **Internet Gateways**: Nenhum gateway deve aparecer
6. **Key Pairs**: Nenhuma chave deve aparecer

### **💡 Dicas de Limpeza:**
- **Sempre excluir na ordem correta** (dependências primeiro)
- **Verificar se não há recursos órfãos** restantes
- **Usar AWS CLI** para limpeza em lote
- **Fazer backup** antes de excluir se necessário

</details>

---

## 🎯 **Próximos Passos**
1. **Criar conta AWS** e ativar Free Tier
2. **Seguir passos da interface web** (mais fácil)
3. **Testar API** em produção
4. **Configurar domínio** (opcional)

## 🔗 **Links Úteis**
- [AWS Free Tier](https://aws.amazon.com/free/)
- [EC2 Pricing](https://aws.amazon.com/ec2/pricing/)
- [Docker Compose](https://docs.docker.com/compose/)
- [AWS Console](https://console.aws.amazon.com/)

---

**✅ Resultado**: Evolution API rodando na AWS com custo zero por 12 meses!

**🎯 Vantagens desta abordagem:**
- ✅ **Mais simples** de configurar
- ✅ **Custo zero** (Free Tier)
- ✅ **Tudo em uma máquina** (mais fácil de gerenciar)
- ✅ **Docker Compose** (igual ao ambiente local)
- ✅ **Escalável** (pode migrar para RDS/ElastiCache depois)

**🌐 Interface Web vs CLI:**
- **Interface Web**: ✅ Mais visual e intuitiva
- **AWS CLI**: ✅ Mais rápida para quem já conhece
- **Recomendação**: Comece pela interface web!
