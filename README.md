# 🚀 ZAPI - WhatsApp API Platform

Uma plataforma completa para integração com WhatsApp Business API, oferecendo envio de mensagens, webhooks e gerenciamento de usuários com sistema de planos e pagamentos.

## 📋 Índice

- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [API Endpoints](#-api-endpoints)
- [Fluxos do Sistema](#-fluxos-do-sistema)
- [Deploy](#-deploy)

## 🏗️ Arquitetura

```mermaid
graph TB
    subgraph "Frontend"
        WEB[Web App]
        MOBILE[Mobile App]
    end
    
    subgraph "Load Balancer"
        NGINX[Nginx Proxy]
    end
    
    subgraph "Backend Services"
        API[NestJS API]
        WSS[WebSocket Service]
    end
    
    subgraph "External Services"
        SUPABASE[(Supabase PostgreSQL)]
        REDIS[(Redis Cloud)]
        MP[MercadoPago API]
        WA[WhatsApp Business API]
    end
    
    WEB --> NGINX
    MOBILE --> NGINX
    NGINX --> API
    NGINX --> WSS
    API --> SUPABASE
    API --> REDIS
    API --> MP
    WSS --> REDIS
    WSS --> WA
```

## ✨ Funcionalidades

### 🔐 Autenticação & Autorização
- Sistema de registro e login
- JWT tokens com expiração configurável
- API Keys para integração externa
- Middleware de autenticação

### 👥 Gerenciamento de Usuários
- Perfis de usuário completos
- Sistema de planos (Free, Pro, Enterprise)
- Controle de limites diários/mensais
- Retenção de dados configurável

### 💬 WhatsApp Integration
- Envio de mensagens via API
- QR Code para autenticação
- Gerenciamento de sessões
- Webhooks para recebimento de mensagens

### 💳 Sistema de Pagamentos
- Integração com MercadoPago
- Webhooks de pagamento
- Upgrade automático de planos
- Histórico de transações

### 📊 Monitoramento
- Logs estruturados
- Métricas de uso
- Health checks
- Rate limiting

## 🛠️ Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM e migrations
- **BullMQ** - Queue system
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas

### Banco de Dados
- **PostgreSQL** (Supabase) - Dados principais
- **Redis** (Redis Cloud) - Cache e filas

### Infraestrutura
- **Docker** - Containerização
- **Nginx** - Load balancer
- **GitHub Actions** - CI/CD

### Integrações
- **MercadoPago** - Pagamentos
- **WhatsApp Business API** - Mensagens

## 🚀 Instalação

### Pré-requisitos
- Node.js 20+
- Yarn
- Docker & docker-compose
- Git

### Instalação do Node.js, NPM e Yarn

#### Ubuntu/Debian
```bash
# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Yarn
npm install -g yarn
```

#### macOS
```bash
# Com Homebrew
brew install node yarn

# Ou com MacPorts
sudo port install nodejs20 +universal
npm install -g yarn
```

#### Windows
```bash
# Com Chocolatey
choco install nodejs yarn

# Ou baixe diretamente:
# Node.js: https://nodejs.org/
# Yarn: https://yarnpkg.com/
```

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/zapi.git
cd zapi
```

### 2. Configure as variáveis de ambiente
```bash
# Backend API
cp backend/api/.env.example backend/api/.env

# Frontend
cp web/.env.example web/.env
```

### 3. Instale as dependências
```bash
# Backend API
cd backend/api
yarn install

# Frontend
cd ../../web
yarn install
```

### 4. Execute os serviços

#### Opção 1: Com Docker (Recomendado)
```bash
# Inicie PostgreSQL e Redis
cd backend/DOCKER
docker compose up -d postgres redis

# Execute migrações
cd ../api
yarn prisma migrate dev
yarn prisma db seed

# Inicie backend
yarn start:dev

# Em outro terminal, inicie frontend
cd ../../web
yarn dev
```

#### Opção 2: Docker Completo
```bash
cd backend/DOCKER
docker compose up -d --build
```

## ⚙️ Configuração

### Variáveis de Ambiente

#### API (.env)
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
REDIS_HOST="redis-host"
REDIS_PORT=6379
REDIS_PASS="redis-password"
REDIS_USER="default"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRE="8"
MP_ACCESS_TOKEN="your-mercadopago-token"
PORT=8080
```

#### docker-compose
```yaml
services:
  api:
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_HOST=redis-host
      - REDIS_PORT=17498
      - REDIS_PASS=password
```

## 📡 API Endpoints

### Autenticação
```http
POST /auth/signup     # Registro de usuário
POST /auth/signin     # Login
```

### Usuários
```http
POST /user                           # Criar usuário
POST /user/login                     # Login alternativo
POST /user/create-api-key           # Gerar API key
GET  /user/whatsapp/qrcode/:userId  # QR Code WhatsApp
POST /user/whatsapp/session         # Criar sessão WhatsApp
```

### Planos
```http
GET /plans            # Listar planos disponíveis
```

### Pagamentos
```http
POST /payments        # Criar pagamento
POST /payments/hook   # Webhook MercadoPago
```

### API Keys
```http
POST   /api-keys      # Criar API key
GET    /api-keys      # Listar API keys
PATCH  /api-keys/:name # Atualizar API key
DELETE /api-keys/:name # Deletar API key
```

## 🔄 Fluxos do Sistema

### 1. Fluxo de Registro de Usuário

```mermaid
sequenceDiagram
    participant U as Usuário
    participant API as API
    participant DB as Database
    participant R as Redis
    
    U->>API: POST /auth/signup
    API->>API: Validar dados
    API->>API: Hash senha
    API->>DB: Criar usuário
    API->>DB: Associar plano padrão
    API->>API: Gerar JWT
    API->>U: Retorna token + dados
```

### 2. Fluxo de Envio de Mensagem WhatsApp

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as API
    participant Q as Queue (Redis)
    participant WSS as WebSocket Service
    participant WA as WhatsApp API
    
    C->>API: POST /messages (com API Key)
    API->>API: Validar API Key
    API->>API: Verificar limites do plano
    API->>Q: Adicionar à fila
    API->>C: 202 Accepted
    
    Q->>WSS: Processar mensagem
    WSS->>WA: Enviar mensagem
    WA->>WSS: Confirmação
    WSS->>API: Webhook status
    API->>DB: Atualizar status
```

### 3. Fluxo de Pagamento

```mermaid
sequenceDiagram
    participant U as Usuário
    participant API as API
    participant MP as MercadoPago
    participant DB as Database
    
    U->>API: POST /payments
    API->>MP: Criar preferência
    MP->>API: URL de pagamento
    API->>U: Retorna URL
    
    U->>MP: Realiza pagamento
    MP->>API: POST /payments/hook
    API->>API: Validar webhook
    API->>DB: Atualizar plano do usuário
    API->>MP: 200 OK
```

### 4. Fluxo de Autenticação WhatsApp

```mermaid
sequenceDiagram
    participant U as Usuário
    participant API as API
    participant WSS as WebSocket Service
    participant WA as WhatsApp
    
    U->>API: GET /user/whatsapp/qrcode/:userId
    API->>WSS: Solicitar QR Code
    WSS->>WA: Iniciar sessão
    WA->>WSS: QR Code
    WSS->>API: Retorna QR Code
    API->>U: QR Code (base64)
    
    U->>WA: Escaneia QR Code
    WA->>WSS: Sessão autenticada
    WSS->>API: Webhook sessão ativa
    API->>DB: Salvar sessão
```

## 🚀 Deploy

### Configuração de Secrets no GitHub
1. Acesse: `Settings → Secrets and variables → Actions`
2. Adicione os secrets:
   - `VPS_IP`: IP da sua VPS
   - `VPS_USER`: usuário SSH (ex: ubuntu)
   - `VPS_SSH_KEY`: chave SSH privada

### Deploy Automático
O deploy é automático via GitHub Actions quando há push na branch `main`:

```yaml
# .github/workflows/prod.yaml
on:
  push:
    branches: [ main ]
```

### Deploy Manual na VPS
```bash
cd ~/zap/backend/DOCKER
sudo docker compose down
sudo docker compose up -d --build
```

## 🔧 Desenvolvimento

### Executando Backend
```bash
cd backend/api

# Desenvolvimento
yarn start:dev

# Produção
yarn build
yarn start:prod

# Testes
yarn test
```

### Executando Frontend
```bash
cd web

# Desenvolvimento
yarn dev

# Build para produção
yarn build
yarn start

# Linting
yarn lint
```

### Banco de Dados
```bash
cd backend/api

# Aplicar migrações
yarn prisma migrate dev

# Reset do banco
yarn prisma migrate reset

# Visualizar dados
yarn prisma studio

# Gerar cliente
yarn prisma generate
```

## 📊 Monitoramento

### Health Check
```bash
curl http://localhost/health
```

### Logs
```bash
# API logs
docker-compose logs api -f

# Worker logs  
docker-compose logs worker -f

# Nginx logs
docker-compose logs proxy -f
```

### Métricas Redis
```bash
# Conectar ao Redis
redis-cli -h redis-host -p 17498 -a password

# Ver filas
KEYS *queue*
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Add nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- 📧 Email: suporte@zapi.com
- 💬 Discord: [Link do servidor]
- 📖 Docs: [Link da documentação]