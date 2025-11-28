---
description: Visão geral da arquitetura e stack tecnológica do sistema Zapi
---

# 🏗 Sobre o Sistema Zapi

O **Zapi** é um SaaS de API para WhatsApp, focado em fornecer uma interface simples e confiável para envio de mensagens, gerenciamento de sessões e webhooks.

## 🛠 Tech Stack

### Backend (`backend/api` & `backend/wss`)
- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (via Prisma ORM)
- **Filas**: Redis + BullMQ
- **Autenticação**: JWT + Bcrypt
- **Pagamentos**: Integração com Mercado Pago
- **WhatsApp Engine**: Baileys / WPPConnect (via `backend/wss`)

### Frontend / Web
- **Framework**: Next.js (React)
- **Estilização**: TailwindCSS

### Infraestrutura
- **Docker**: Containerização da aplicação e serviços (Redis, Postgres)
- **Proxy/Server**: Nginx (para deploy em produção)

## 🧩 Arquitetura

O sistema é dividido em serviços para melhor escalabilidade:

1.  **API (`backend/api`)**:
    - Gerencia usuários, autenticação, planos e pagamentos.
    - Recebe requisições HTTP dos clientes (ex: enviar mensagem).
    - Enfileira jobs no Redis (BullMQ) para serem processados.
    - Consome filas de Webhook para notificar clientes.

2.  **WSS (`backend/wss`)**:
    - Serviço dedicado à conexão com o WhatsApp.
    - Consome a fila `create-user` para iniciar sessões.
    - Consome a fila `send-message` (provável) ou processa eventos do WhatsApp.
    - Gerencia as instâncias do WPPConnect/Baileys.

## 🔄 Fluxos Principais

1.  **Envio de Mensagem**:
    - Cliente chama API `/send-message` com API Key.
    - API valida chave (cache no Redis) e status da sessão.
    - Mensagem é colocada na fila `send-message`.
    - Worker (no WSS) processa a fila e envia via instância do WhatsApp.

2.  **Webhooks**:
    - Eventos do WhatsApp (ex: mensagem recebida) são capturados pelo WSS.
    - WSS enfileira job de webhook.
    - Worker de Webhook (`WebhookProcessor` na API) processa o job.
    - Busca URL de webhook do usuário (cache no Redis `webhook:{userId}`).
    - Envia POST para o cliente com assinatura HMAC.

3.  **Pagamentos**:
    - Webhooks do Mercado Pago atualizam o status da assinatura no banco de dados.
