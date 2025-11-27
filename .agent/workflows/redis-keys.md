---
description: Documentação das chaves e padrões utilizados no Redis
---

# 🔑 Redis Keys & Patterns

Este documento lista os padrões de chaves utilizados no Redis para o projeto Zapi. Manter este arquivo atualizado ajuda na depuração e manutenção do cache e estado.

## 📌 Padrões de Chaves

### Sessão e Status do Usuário
- **`user:{userId}:status`**
    - **Descrição**: Armazena o status atual da conexão do WhatsApp do usuário.
    - **Valores**: `'connected'`, `'disconnected'`, `'connecting'`, etc.
    - **Uso**: Verificado antes de enviar mensagens para garantir que a sessão está ativa.
    - **Exemplo**: `user:123e4567-e89b-12d3-a456-426614174000:status`

### Filas (BullMQ)
O BullMQ gerencia suas próprias chaves com o prefixo padrão `bull:`.
- **`bull:send-message:*`**
    - **Descrição**: Chaves relacionadas à fila de envio de mensagens.
    - **Estrutura**: Hashs, Sets e Lists gerenciados pelo BullMQ para jobs, status, etc.

### Outros (Potenciais)
- **`session:{sessionId}`** (A verificar se usado diretamente ou via biblioteca)
    - Armazenamento de dados da sessão do Baileys (se persistência em Redis estiver ativa).

## 🛠 Comandos Úteis

Para verificar chaves no CLI do Redis:

```bash
# Listar chaves de status de usuários
KEYS user:*:status

# Ver valor de um status
GET user:UUID_DO_USUARIO:status

# Monitorar comandos em tempo real
MONITOR
```
