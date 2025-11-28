# Filas do Sistema (Queues)

Este documento descreve as filas existentes no serviço de WebSocket (WSS), seus propósitos, estrutura de dados esperada e configurações.

As filas são gerenciadas utilizando o **BullMQ** e processadas por workers dedicados.

## Visão Geral

Atualmente, existem 2 filas principais configuradas no sistema:

1.  **`create-user`**: Responsável pela criação e inicialização de sessões do WhatsApp.
2.  **`send-message`**: Responsável pelo envio de mensagens via WhatsApp.

---

## 1. Fila: `create-user`

### Propósito
Gerencia a criação de novas sessões do WhatsApp para os usuários. Quando um job é processado nesta fila, o sistema tenta iniciar uma nova sessão do WhatsApp Web para o usuário especificado.

### Configuração
- **Nome da Fila**: `create-user`
- **Processor**: `UserCreate` (`src/queues/user-create/user-create.processor.ts`)
- **Enum**: `EProcessor.CREATE_USER`

### Estrutura do Job (Payload)
O job deve conter os seguintes dados:

```typescript
interface IJobData {
  idUser: number;   // ID do usuário no sistema
}
```

### Comportamento de Processamento
1.  Recebe o `idUser`.
2.  Chama `whatsappService.createSession(idUser)` para iniciar a sessão.
3.  Logs de eventos:
    -   `active`: Job iniciado.
    -   `completed`: Job finalizado com sucesso.
    -   `failed`: Job falhou (erro logado).

---

## 2. Fila: `send-message`

### Propósito
Gerencia o envio de mensagens de texto via WhatsApp. Esta fila possui mecanismos de retentativa (retry) configurados para garantir a entrega em caso de falhas temporárias.

### Configuração
- **Nome da Fila**: `send-message`
- **Processor**: `SendMessage` (`src/queues/send-message/send-message.processor.ts`)
- **Enum**: `EProcessor.SEND_MESSAGE`
- **Opções Padrão**:
    -   **Tentativas (Attempts)**: 3
    -   **Backoff**: Exponencial (delay inicial de 1000ms)

### Estrutura do Job (Payload)
O job deve conter os seguintes dados:

```typescript
interface IJobData {
  idUser: string;   // ID do usuário (dono da sessão)
  telefone: string; // Número de telefone do destinatário (com DDI e DDD)
  text: string;     // Conteúdo da mensagem de texto
}
```

### Comportamento de Processamento
1.  Recebe `idUser`, `telefone` e `text`.
2.  Chama `whatsappService.sendMessage(idUser, telefone, text)`.
3.  **Tratamento de Erros**:
    -   Se o envio falhar, o job será retentado até 3 vezes (conforme configuração).
    -   **Exceção**: Se o erro for "Maximum call stack size exceeded" (indicando possível loop ou erro crítico na sessão), o job falha imediatamente com uma mensagem específica ("WhatsApp session error - session needs restart") e não é retentado da mesma forma padrão.
4.  Logs de eventos:
    -   `active`: Job iniciado.
    -   `completed`: Job finalizado com sucesso.
    -   `failed`: Job falhou (erro e stack trace logados).

---

## Como Adicionar Novas Filas

Para adicionar uma nova fila ao sistema:

1.  **Definir o Nome**: Adicione uma nova entrada no enum `EProcessor` em `src/queues/types/index.ts`.
2.  **Criar o Processor**:
    -   Crie uma nova pasta em `src/queues/` (ex: `my-new-queue`).
    -   Crie o arquivo do processor (ex: `my-new-queue.processor.ts`).
    -   Implemente a classe herdando de `WorkerHost` e decore com `@Processor(EProcessor.MY_NEW_QUEUE)`.
    -   Defina a interface `IJobData` para o payload.
3.  **Registrar no Módulo**:
    -   No arquivo `src/queues/queue.module.ts`:
        -   Importe o novo processor.
        -   Adicione `BullModule.registerQueue({ name: 'my-new-queue' })` nos `imports`.
        -   Adicione o processor nos `providers`.
