---
description: Visão geral da arquitetura e stack tecnológica do sistema Zapi
---

# 🏗 Sobre o Sistema Zapi

O **Zapi** é um SaaS de API para WhatsApp, focado em fornecer uma interface simples e confiável para envio de mensagens, gerenciamento de sessões e webhooks.

## 🛠 Tech Stack

### Backend (`backend/api`)
- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (via Prisma ORM)
- **Filas**: Redis + BullMQ
- **Autenticação**: JWT + Bcrypt
- **Pagamentos**: Integração com Mercado Pago
- **WhatsApp Engine**: Baileys (biblioteca para conexão com WhatsApp Web)

### Frontend / Web
- **Framework**: Next.js (React)
- **Estilização**: TailwindCSS (provável, padrão moderno)

### Infraestrutura
- **Docker**: Containerização da aplicação e serviços (Redis, Postgres)
- **Proxy/Server**: Nginx (para deploy em produção)

## 🧩 Arquitetura

O sistema segue uma arquitetura modular baseada no NestJS.

### Principais Módulos:
- **Auth**: Gerenciamento de login, registro e JWT.
- **User**: Gerenciamento de usuários e dados de perfil.
- **ApiKey**: Geração e validação de chaves de API para acesso externo.
- **Whatsapp**: Núcleo da integração com o Baileys, gerenciamento de sessões e envio de mensagens.
- **Webhook**: Processamento e envio de eventos (mensagens recebidas, status) para os clientes.
- **Redis**: Serviço wrapper para interação com o Redis (cache e estado).
- **Queue**: Processamento assíncrono de mensagens usando BullMQ.

## 🔄 Fluxos Principais

1.  **Envio de Mensagem**:
    - Cliente chama API `/send-message` com API Key.
    - API valida chave e status da sessão no Redis.
    - Mensagem é colocada na fila `send-message` (BullMQ).
    - Worker processa a fila e usa a sessão do Baileys para enviar.

2.  **Webhooks**:
    - Eventos do Baileys (ex: mensagem recebida) são capturados.
    - Eventos são enviados para a URL de webhook configurada pelo usuário.

3.  **Pagamentos**:
    - Webhooks do Mercado Pago atualizam o status da assinatura no banco de dados.
