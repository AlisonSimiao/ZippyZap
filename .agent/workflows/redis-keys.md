---
description: Documentação das chaves e padrões utilizados no Redis
---

# 🔑 Redis Keys & Patterns

Este documento lista os padrões de chaves utilizados no Redis para o projeto Zapi. Manter este arquivo atualizado ajuda na depuração e manutenção do cache e estado.

## 📌 Padrões de Chaves

### Sessão e Status do Usuário
- **`user:{userId}:status`**
    - **Descrição**: Armazena o status atual da conexão do WhatsApp do usuário.
    - **Valores**: 
        - `'connected'`: Sessão ativa e conectada.
        - `'disconnected'`: Sessão desconectada.
        - `'inChat'`, `'isLogged'`: Estados intermediários do Baileys que indicam conexão.
    - **Uso**: Verificado antes de enviar mensagens e para restaurar sessões ao reiniciar o serviço.
    - **Exemplo**: `user:123e4567-e89b-12d3-a456-426614174000:status`

- **`user:{userId}:qrcode`**
    - **Descrição**: Armazena o QR Code gerado para autenticação.
    - **Formato**: JSON string `{ qr: "base64...", expireAt: timestamp }`
    - **Uso**: Recuperado pelo endpoint `/qrcode` para exibir ao usuário.

### Cache de Autenticação e Configuração
- **`apiKey:{hash}`**
    - **Descrição**: Cache dos dados da API Key para evitar consultas frequentes ao banco de dados no middleware.
    - **Conteúdo**: JSON com `id`, `userId` e dados do plano.
    - **TTL**: 3 horas.

- **`webhook:{userId}`**
    - **Descrição**: Cache da URL de webhook e API Key do usuário para envio de eventos.
    - **Conteúdo**: JSON `{ url: string, apiKey: string }`.
    - **TTL**: 4 horas.

### Filas (BullMQ)
O BullMQ gerencia suas próprias chaves com o prefixo padrão `bull:`.
- **`bull:send-message:*`**
    - Fila para envio de mensagens.
- **`bull:create-user:*`**
    - Fila para criação e gerenciamento de sessões.
- **`bull:webhook:*`** (provável, baseado no processador)
    - Fila para envio de webhooks.

## 🛠 Comandos Úteis

Para verificar chaves no CLI do Redis:

```bash
# Listar chaves de status de usuários
KEYS user:*:status

# Ver valor de um status
GET user:UUID_DO_USUARIO:status

# Ver QR Code armazenado
GET user:UUID_DO_USUARIO:qrcode

# Limpar cache de uma API Key específica
DEL apiKey:HASH_DA_CHAVE

# Monitorar comandos em tempo real
MONITOR
```
