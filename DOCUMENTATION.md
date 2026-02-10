# 📚 Documentação Completa - ZippyZap API

## Índice

1. [Visão Geral](#visão-geral)
2. [Casos de Uso](#casos-de-uso)
3. [Como Utilizar](#como-utilizar)
4. [Webhooks](#webhooks)
5. [Segurança e Prevenção de Abusos](#segurança-e-prevenção-de-abusos)
6. [API Reference](#api-reference)
7. [Exemplos de Código](#exemplos-de-código)
8. [FAQ](#faq)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **ZippyZap** é uma plataforma completa de API WhatsApp que permite integrar funcionalidades de mensageria WhatsApp em suas aplicações, sistemas e processos de negócio de forma simples, rápida e confiável.

### Principais Recursos

- ✅ Envio de mensagens de texto, imagens, documentos e mídias
- ✅ Webhooks em tempo real para receber mensagens e status
- ✅ Autenticação segura via API Keys
- ✅ Rate limiting inteligente por plano
- ✅ Suporte a múltiplas sessões WhatsApp
- ✅ Dashboard completo para gerenciamento
- ✅ Logs detalhados de todas as operações
- ✅ Documentação completa e exemplos de código

### Arquitetura

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│  ZippyZap   │
│     API     │
└──────┬──────┘
       │
       ├──────► PostgreSQL (Dados)
       ├──────► Redis (Filas)
       └──────► WhatsApp API (Baileys)
```

---

## 💡 Casos de Uso

### 1. E-commerce

**Automatize notificações de pedidos e entregas**

- Confirmação de pedidos em tempo real
- Rastreamento de entregas
- Recuperação de carrinho abandonado
- Promoções e ofertas personalizadas
- Avaliações pós-compra

**Exemplo de Fluxo:**
```
Pedido Criado → API ZippyZap → WhatsApp Cliente
    ↓
Pedido Enviado → API ZippyZap → WhatsApp Cliente (com link de rastreamento)
    ↓
Pedido Entregue → API ZippyZap → WhatsApp Cliente (solicitar avaliação)
```

### 2. Notificações e Alertas

**Envie alertas importantes em tempo real**

- Lembretes de agendamentos (consultas, reuniões)
- Alertas de segurança (2FA, login suspeito)
- Atualizações de sistema
- Confirmações de transações
- Notificações de vencimento

**Exemplo de Implementação:**
```javascript
// Lembrete de consulta 24h antes
const sendAppointmentReminder = async (appointment) => {
  await zippyzap.sendMessage({
    to: appointment.phone,
    type: 'text',
    message: `Olá ${appointment.name}! Lembrete: você tem consulta amanhã às ${appointment.time}. Confirme sua presença respondendo SIM.`
  });
};
```

### 3. Marketing

**Campanhas de marketing direto com alto engajamento**

- Campanhas promocionais segmentadas
- Newsletters e atualizações
- Pesquisas de satisfação
- Programas de fidelidade
- Lançamento de produtos

**Boas Práticas:**
- ✅ Obtenha consentimento prévio (opt-in)
- ✅ Segmente sua audiência
- ✅ Personalize mensagens
- ✅ Ofereça opt-out fácil
- ✅ Respeite horários comerciais

### 4. Atendimento ao Cliente

**Suporte automatizado e eficiente**

- Chatbots inteligentes
- Respostas automáticas (FAQ)
- Tickets de suporte
- Acompanhamento de solicitações
- Pesquisas de satisfação (NPS)

**Exemplo de Chatbot Simples:**
```javascript
// Webhook handler para mensagens recebidas
app.post('/webhook', async (req, res) => {
  const { from, message } = req.body.data;
  
  const responses = {
    'oi': 'Olá! Como posso ajudar?',
    'horario': 'Funcionamos de segunda a sexta, das 9h às 18.',
    'suporte': 'Vou transferir você para um atendente. Aguarde...'
  };
  
  const reply = responses[message.toLowerCase()] || 
                'Desculpe, não entendi. Digite MENU para ver opções.';
  
  await zippyzap.sendMessage({
    to: from,
    type: 'text',
    message: reply
  });
  
  res.status(200).send('OK');
});
```

---

## 🚀 Como Utilizar

### Passo 1: Criar Conta

1. Acesse [https://zippyzap.com/signup](https://zippyzap.com/signup)
2. Preencha seus dados
3. Confirme seu email
4. Receba 1.000 mensagens grátis para testar

### Passo 2: Gerar API Key

1. Faça login no dashboard
2. Vá para **Configurações → API Keys**
3. Clique em **"Criar Nova Chave"**
4. Dê um nome descritivo (ex: "Produção", "Desenvolvimento")
5. Copie e guarde a chave em local seguro

**⚠️ Importante:** A API Key só é exibida uma vez. Se perdê-la, será necessário gerar uma nova.

### Passo 3: Configurar WhatsApp

1. No dashboard, acesse **WhatsApp → Sessões**
2. Clique em **"Nova Sessão"**
3. Escaneie o QR Code com seu WhatsApp
4. Aguarde a confirmação de conexão

**Dica:** Use um número dedicado para produção, não seu número pessoal.

### Passo 4: Enviar Primeira Mensagem

#### cURL
```bash
curl -X POST https://api.zippyzap.com/v1/messages \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+5511999999999",
    "type": "text",
    "message": "Olá! Sua mensagem foi enviada."
  }'
```

#### Node.js
```javascript
const axios = require('axios');

const sendMessage = async () => {
  try {
    const response = await axios.post(
      'https://api.zippyzap.com/v1/messages',
      {
        to: '+5511999999999',
        type: 'text',
        message: 'Olá! Sua mensagem foi enviada.'
      },
      {
        headers: {
          'X-API-Key': 'YOUR_API_KEY',
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Mensagem enviada:', response.data);
  } catch (error) {
    console.error('Erro:', error.response.data);
  }
};

sendMessage();
```

#### Python
```python
import requests

def send_message():
    url = "https://api.zippyzap.com/v1/messages"
    headers = {
        "X-API-Key": "YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    data = {
        "to": "+5511999999999",
        "type": "text",
        "message": "Olá! Sua mensagem foi enviada."
    }
    
    response = requests.post(url, json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

send_message()
```

#### PHP
```php
<?php
$apiKey = 'YOUR_API_KEY';
$url = 'https://api.zippyzap.com/v1/messages';

$data = [
    'to' => '+5511999999999',
    'type' => 'text',
    'message' => 'Olá! Sua mensagem foi enviada.'
];

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n" .
                     "X-API-Key: $apiKey\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo $result;
?>
```

---

## 🔔 Webhooks

### Como Funcionam

Webhooks são chamadas HTTP POST que o ZippyZap faz para sua aplicação quando eventos importantes acontecem.

### Configuração

1. Acesse **Dashboard → Configurações → Webhooks**
2. Insira a URL do seu endpoint (ex: `https://seusite.com/webhook`)
3. Selecione os eventos que deseja receber
4. Salve e teste a conexão

### Eventos Disponíveis

| Evento | Descrição |
|--------|-----------|
| `message.received` | Nova mensagem recebida |
| `message.sent` | Mensagem enviada com sucesso |
| `message.delivered` | Mensagem entregue ao destinatário |
| `message.read` | Mensagem lida pelo destinatário |
| `message.failed` | Falha no envio da mensagem |
| `session.connected` | Sessão WhatsApp conectada |
| `session.disconnected` | Sessão WhatsApp desconectada |

### Exemplo de Payload

```json
{
  "event": "message.received",
  "timestamp": "2024-11-22T10:30:00Z",
  "data": {
    "messageId": "msg_abc123",
    "from": "+5511999999999",
    "to": "+5511888888888",
    "type": "text",
    "message": "Olá!",
    "timestamp": "2024-11-22T10:30:00Z"
  }
}
```

### Implementação do Handler

#### Node.js/Express
```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Validar assinatura do webhook
function validateWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return hash === signature;
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  // Validar assinatura
  if (!validateWebhookSignature(req.body, signature, webhookSecret)) {
    return res.status(401).send('Invalid signature');
  }
  
  const { event, data } = req.body;
  
  switch(event) {
    case 'message.received':
      console.log('Nova mensagem:', data.message);
      // Processar mensagem recebida
      break;
    case 'message.sent':
      console.log('Mensagem enviada:', data.messageId);
      break;
    case 'message.delivered':
      console.log('Mensagem entregue:', data.messageId);
      break;
    case 'message.read':
      console.log('Mensagem lida:', data.messageId);
      break;
    case 'session.disconnected':
      console.log('Sessão desconectada! Reconectar...');
      // Implementar lógica de reconexão
      break;
  }
  
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Segurança dos Webhooks

1. **Validação de Assinatura**: Sempre valide o header `X-Webhook-Signature`
2. **HTTPS Obrigatório**: Use apenas URLs HTTPS
3. **Timeout**: Responda em até 5 segundos
4. **Idempotência**: Prepare-se para receber o mesmo evento múltiplas vezes
5. **Retry**: Implemente retry logic para processar eventos falhados

---

## 🔒 Segurança e Prevenção de Abusos

### Mecanismos de Segurança

#### 1. Autenticação por API Key
- Todas as requisições devem incluir header `X-API-Key`
- API Keys são únicas e podem ser revogadas a qualquer momento
- Suporte a múltiplas chaves para diferentes ambientes

#### 2. Rate Limiting
| Plano | Limite |
|-------|--------|
| Free | 10 req/min |
| Pro | 100 req/min |
| Enterprise | Customizado |

#### 3. Criptografia TLS 1.3
- Todas as comunicações são criptografadas
- Certificados SSL/TLS atualizados automaticamente

#### 4. Logs de Auditoria
- Todas as ações são registradas
- Retenção de logs por 90 dias (Pro/Enterprise)
- Análise de anomalias em tempo real

#### 5. Detecção de Spam
- Algoritmos de ML identificam padrões de spam
- Bloqueio automático de contas suspeitas
- Análise de conteúdo em tempo real

### Políticas de Uso Aceitável

**❌ Práticas Proibidas:**

1. Envio de spam ou mensagens não solicitadas
2. Compartilhamento de conteúdo ilegal ou ofensivo
3. Phishing, fraudes ou golpes
4. Burlar limites de rate limiting
5. Compartilhar API Keys com terceiros
6. Usar múltiplas contas para contornar limites
7. Enviar mensagens sem consentimento prévio
8. Violar políticas do WhatsApp

**✅ Boas Práticas:**

1. **Obtenha Consentimento**: Sempre peça permissão antes de enviar mensagens
2. **Respeite Horários**: Evite enviar mensagens à noite/madrugada
3. **Ofereça Opt-out**: Permita cancelamento fácil
4. **Mantenha API Keys Seguras**: Nunca exponha em código público
5. **Monitore Uso**: Acompanhe métricas e logs
6. **Use Webhooks**: Rastreie status e evite reenvios
7. **Valide Números**: Verifique formato antes de enviar
8. **Implemente Retry Logic**: Use backoff exponencial

---

## 📖 API Reference

### Base URL
```
https://api.zippyzap.com/v1
```

### Autenticação
Todas as requisições devem incluir o header:
```
X-API-Key: YOUR_API_KEY
```

### Endpoints

#### 1. Enviar Mensagem de Texto

**POST** `/messages`

**Headers:**
```
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

**Body:**
```json
{
  "to": "+5511999999999",
  "type": "text",
  "message": "Sua mensagem aqui"
}
```

**Response 200:**
```json
{
  "success": true,
  "messageId": "msg_abc123",
  "status": "queued",
  "timestamp": "2024-11-22T10:30:00Z"
}
```

#### 2. Enviar Imagem

**POST** `/messages`

**Body:**
```json
{
  "to": "+5511999999999",
  "type": "image",
  "media": "https://example.com/image.jpg",
  "caption": "Legenda opcional"
}
```

#### 3. Enviar Documento

**POST** `/messages`

**Body:**
```json
{
  "to": "+5511999999999",
  "type": "document",
  "media": "https://example.com/document.pdf",
  "filename": "documento.pdf"
}
```

#### 4. Obter QR Code

**GET** `/whatsapp/qrcode`

**Headers:**
```
X-API-Key: YOUR_API_KEY
```

**Response 200:**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "expiresIn": 60,
  "status": "pending"
}
```

#### 5. Criar Sessão WhatsApp

**POST** `/whatsapp/session`

**Response 201:**
```json
{
  "success": true,
  "sessionId": "session_xyz789",
  "status": "initializing",
  "message": "Sessão criada. Use /qrcode para obter o QR Code"
}
```

#### 6. Criar API Key

**POST** `/api-keys`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Production API"
}
```

**Response 201:**
```json
{
  "success": true,
  "apiKey": "zapi_live_abc123def456ghi789",
  "name": "Production API",
  "createdAt": "2024-11-22T10:30:00Z"
}
```

### Códigos de Erro

| Código | Descrição | Solução |
|--------|-----------|---------|
| 400 | Bad Request | Verifique os parâmetros enviados |
| 401 | Unauthorized | API Key inválida ou ausente |
| 403 | Forbidden | Limite do plano excedido |
| 429 | Too Many Requests | Aguarde antes de fazer novas requisições |
| 500 | Internal Server Error | Tente novamente ou contate o suporte |

---

## 💻 Exemplos de Código

### Enviar Mensagem com Retry Logic

```javascript
const axios = require('axios');

async function sendMessageWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.post(
        'https://api.zippyzap.com/v1/messages',
        data,
        {
          headers: {
            'X-API-Key': process.env.ZIPPYZAP_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limit - aguardar antes de retentar
        const waitTime = Math.pow(2, i) * 1000; // Backoff exponencial
        console.log(`Rate limit hit. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (i === maxRetries - 1) {
        throw error; // Última tentativa falhou
      }
    }
  }
}

// Uso
sendMessageWithRetry({
  to: '+5511999999999',
  type: 'text',
  message: 'Olá!'
}).then(result => {
  console.log('Mensagem enviada:', result);
}).catch(error => {
  console.error('Falha ao enviar:', error);
});
```

### Enviar Mensagens em Lote

```javascript
async function sendBulkMessages(recipients, message) {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendMessageWithRetry({
        to: recipient.phone,
        type: 'text',
        message: message.replace('{name}', recipient.name)
      });
      results.push({ phone: recipient.phone, success: true, result });
      
      // Aguardar entre envios para respeitar rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ phone: recipient.phone, success: false, error: error.message });
    }
  }
  
  return results;
}

// Uso
const recipients = [
  { phone: '+5511999999999', name: 'João' },
  { phone: '+5511888888888', name: 'Maria' }
];

sendBulkMessages(recipients, 'Olá {name}! Temos uma promoção especial para você.')
  .then(results => console.log('Resultados:', results));
```

---

## ❓ FAQ

### Como obtenho minha API Key?
Após criar sua conta, acesse o dashboard e vá para "API Keys". Clique em "Criar Nova Chave" e guarde-a em local seguro.

### Preciso de um número WhatsApp oficial?
Não! O ZippyZap funciona com WhatsApp regular (não Business). Você pode usar seu número WhatsApp pessoal ou criar um novo número. Recomendamos usar um número dedicado para produção.

### Qual é o limite de mensagens por segundo?
Varia por plano: Free (10 req/min), Pro (100 req/min), Enterprise (customizado).

### Como funcionam os webhooks?
Configure uma URL no dashboard para receber notificações em tempo real sobre eventos. Seu endpoint deve responder com status 200 em até 5 segundos.

### Posso enviar mensagens em massa?
Sim, mas você deve respeitar as políticas do WhatsApp e obter consentimento prévio dos destinatários.

### Quais tipos de mídia são suportados?
- **Imagens:** JPG, PNG, GIF (máx 5MB)
- **Documentos:** PDF, DOC, DOCX, XLS, XLSX (máx 100MB)
- **Áudio:** MP3, OGG, AAC (máx 16MB)
- **Vídeo:** MP4, 3GP (máx 16MB)

---

## 🔧 Troubleshooting

### Erro 401 - Unauthorized

**Causa:** API Key inválida ou ausente

**Solução:**
1. Verifique se o header `X-API-Key` está presente
2. Confirme que a API Key está correta
3. Verifique se a chave não foi revogada no dashboard

### Erro 429 - Too Many Requests

**Causa:** Limite de rate limiting excedido

**Solução:**
1. Implemente backoff exponencial
2. Distribua requisições ao longo do tempo
3. Considere upgrade de plano

### Sessão WhatsApp desconectou

**Causa:** Logout no app ou inatividade prolongada

**Solução:**
1. Acesse o dashboard
2. Vá para "WhatsApp → Sessões"
3. Escaneie um novo QR Code
4. Configure webhooks para alertas de desconexão

### Mensagens não estão sendo entregues

**Possíveis Causas:**
1. Número de destino inválido
2. Número bloqueou seu contato
3. Sessão WhatsApp desconectada
4. Limite de mensagens excedido

**Solução:**
1. Valide o formato do número (+5511999999999)
2. Verifique status da sessão no dashboard
3. Consulte logs de envio
4. Configure webhooks para rastrear status

### Webhooks não estão sendo recebidos

**Checklist:**
1. ✅ URL usa HTTPS?
2. ✅ Endpoint responde em até 5 segundos?
3. ✅ Firewall permite requisições do ZippyZap?
4. ✅ Eventos corretos estão selecionados?

---

## 📞 Suporte

- 📧 **Email:** suporte@zippyzap.com
- 💬 **Chat:** Disponível no dashboard
- 📖 **Documentação:** https://docs.zippyzap.com
- 🐛 **Reportar Bug:** https://github.com/zippyzap/issues

---

**© 2024 ZippyZap. Todos os direitos reservados.**
