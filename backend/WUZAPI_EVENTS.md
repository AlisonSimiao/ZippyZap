# WuzAPI Events Documentation

## Overview
This document describes all the events that WuzAPI can send to our webhook endpoint and how they are handled in the system.

## Subscribed Events

When a WhatsApp session is created via `WuzapiClientService.startSession()`, the system subscribes to the following events:

### 1. **Message**
- **Description**: Triggered when a message is received or sent
- **Handler**: `WuzapiWebhookController` - Logs the message and marks it for future webhook dispatch
- **Status**: ✅ Implemented (logging only)
- **TODO**: Process incoming message (webhook dispatch, etc.)

### 2. **ReadReceipt**
- **Description**: Triggered when a message is marked as read
- **Handler**: `WuzapiWebhookController` - Logs read receipt events
- **Status**: ✅ Implemented (logging only)
- **TODO**: Process read receipt

### 3. **Receipt**
- **Description**: Provides confirmations for message delivery statuses
- **Handler**: `WuzapiWebhookController` - Logs delivery receipt events
- **Status**: ✅ Implemented (logging only)
- **TODO**: Process delivery receipt

### 4. **Presence**
- **Description**: Updates about contact online/offline status
- **Handler**: `WuzapiWebhookController` - Logs presence updates
- **Status**: ✅ Implemented (logging only)
- **TODO**: Process presence update

### 5. **ChatPresence**
- **Description**: More granular chat-specific presence (typing, recording, etc.)
- **Handler**: `WuzapiWebhookController` - Logs chat presence events
- **Status**: ✅ Implemented (logging only)
- **TODO**: Process chat presence (typing, recording, etc.)

### 6. **HistorySync**
- **Description**: Related to synchronization of chat history
- **Handler**: `WuzapiWebhookController` - Logs history sync events
- **Status**: ✅ Implemented (logging only)
- **TODO**: Process history sync

### 7. **Group**
- **Description**: Events related to WhatsApp groups (creation, updates, participant changes)
- **Handler**: `WuzapiWebhookController` - Logs group events
- **Status**: ✅ Implemented (logging only)
- **TODO**: Process group event

### 8. **UndecryptableMessage**
- **Description**: Triggered when a message cannot be decrypted
- **Handler**: `WuzapiWebhookController` - Logs undecryptable message warnings
- **Status**: ✅ Implemented (logging only)
- **TODO**: Handle undecryptable message

### 9. **MediaRetry**
- **Description**: Indicates an attempt to resend media
- **Handler**: `WuzapiWebhookController` - Logs media retry events
- **Status**: ✅ Implemented (logging only)
- **TODO**: Process media retry

## Special Events (Not in Subscribe list)

These events are sent by WuzAPI but are not part of the Subscribe array:

### **QR**
- **Description**: QR code for session authentication
- **Handler**: Stores QR code in Redis with 60-second expiration
- **Status**: ✅ Fully implemented

### **Connected / ready / authenticated**
- **Description**: Session successfully connected to WhatsApp
- **Handler**: Updates user status to 'connected' in Redis and removes QR code
- **Status**: ✅ Fully implemented

### **Disconnected / disconnected / auth_failure**
- **Description**: Session disconnected from WhatsApp
- **Handler**: Removes user status and QR code from Redis
- **Status**: ✅ Fully implemented

## Implementation Details

### Subscribe Configuration
Location: `backend/wss/src/whatsapp/wuzapi-client.service.ts`

```typescript
Subscribe: [
    "Message",
    "ReadReceipt", 
    "Presence",
    "ChatPresence",
    "HistorySync",
    "Group",
    "Receipt",
    "UndecryptableMessage",
    "MediaRetry"
]
```

### Webhook Handler
Location: `backend/api/src/webhook/wuzapi-webhook.controller.ts`

The webhook controller receives all events and processes them in a switch statement based on `payload.type`.

## Future Improvements

1. **Message Processing**: Implement full message processing pipeline
2. **Webhook Dispatch**: Forward events to user-configured webhooks
3. **Event Storage**: Store relevant events in database for history/analytics
4. **Event Filtering**: Allow users to configure which events they want to receive
5. **Rate Limiting**: Implement rate limiting for high-volume events

## Notes

- The `Immediate: true` flag in the connect request tells WuzAPI to start the session immediately
- All events are logged for debugging purposes
- The webhook endpoint responds with 200 OK immediately to prevent timeouts
- Event processing happens asynchronously after the response is sent

## References

- [WuzAPI GitHub Repository](https://github.com/asternic/wuzapi)
- [Whatsmeow Library](https://github.com/tulir/whatsmeow) (underlying library used by WuzAPI)
