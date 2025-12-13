# Webhook Job Types Organization

This document describes the organized type system for webhook job data in the Zapi backend.

## Overview

All webhook events are now organized into clear categories with strongly-typed interfaces. This provides better type safety, code completion, and documentation.

## Event Categories

### Message Events
Events related to WhatsApp messages:

- **`message.received`** - When a message is received
- **`message.sent`** - When a message is successfully sent
- **`message.delivered`** - When a message is delivered to the recipient
- **`message.read`** - When a message is read by the recipient
- **`message.failed`** - When a message fails to send

### Session Events
Events related to WhatsApp session status:

- **`session.connected`** - When a WhatsApp session connects
- **`session.disconnected`** - When a WhatsApp session disconnects
- **`QR`** - QR code generation for authentication

### Other Events
Additional WhatsApp events:

- **`presence`** - User presence updates (online/offline/typing)
- **`chat_presence`** - Chat-specific presence (composing/recording)
- **`group`** - Group-related events
- **`history_sync`** - Message history synchronization
- **`media_retry`** - Media download retry attempts
- **`undecryptable_message`** - Messages that couldn't be decrypted

## Type Structure

### Base Interface

```typescript
interface IWebhookJob {
  idUser: string;
  type: WebhookEventType;
  data: Record<string, any>;
}
```

### Specific Job Types

Each event type has its own specific interface. For example:

```typescript
interface MessageReceivedWebhookJob {
  idUser: string;
  type: 'message.received';
  data: MessageReceivedJobData;
}
```

### Data Interfaces

Each event type has a corresponding data interface defining the expected payload structure:

```typescript
interface MessageReceivedJobData {
  messageId: string;
  from: string;
  to: string;
  body?: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact';
  timestamp: number;
  [key: string]: any; // Allows additional fields
}
```

## Usage

### In Controllers

```typescript
import { IWebhookJob, QRWebhookJob } from './webhook-job.types';

// Method returns a strongly-typed webhook job
QR(payload: WuzapiWebhookPayload): QRWebhookJob | null {
  return {
    idUser: payload.instanceName,
    type: 'QR' as const, // 'as const' ensures literal type
    data: {
      qr: payload.qrCodeBase64,
      expireAt: Date.now() + 60000,
    },
  };
}
```

### In Processors

```typescript
import { IWebhookJob } from './webhook-job.types';

async process(job: Job<IWebhookJob>): Promise<any> {
  // TypeScript knows the structure of job.data
  const { idUser, type, data } = job.data;
  
  // Type-safe event handling
  switch (type) {
    case 'message.received':
      // data is typed as MessageReceivedJobData
      break;
    case 'QR':
      // data is typed as QRJobData
      break;
  }
}
```

## Benefits

1. **Type Safety**: Compile-time checks ensure correct data structures
2. **Code Completion**: IDEs can suggest available properties
3. **Documentation**: Types serve as inline documentation
4. **Refactoring**: Easier to track usage across the codebase
5. **Consistency**: Enforces consistent event naming and structure

## Migration Notes

The following event type changes were made for better organization:

- `read_receipt` → `message.read`
- `receipt` → `message.delivered`
- `session` → `session.connected` (for status updates)
- `message` → `message.received`

Legacy event types are still supported in the webhook processor for backward compatibility.
