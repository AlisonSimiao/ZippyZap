# Rate Limiting Strategy

## Overview

O sistema implementa três níveis de proteção:

1. **Global Rate Limiting** - Proteção contra DDoS em todos endpoints
2. **Public Endpoints Protection** - Limite mais restritivo para endpoints públicos
3. **Plan-based Rate Limiting** - Limites específicos por plano do usuário

## Global Rate Limiting

Configurado via `ThrottlerModule` com dois níveis:

### Nível 1: Endpoints Públicos (Mais Restritivo)

```env
THROTTLE_PUBLIC_TTL=60000      # 60 segundos
THROTTLE_PUBLIC_LIMIT=20       # 20 req/min
```

Protege contra DDoS e brute force:
- `/auth/signup` - Registro
- `/auth/signin` - Login
- `/plans` - Listar planos
- `/health` - Health check
- `/webhooks/*` - Webhooks
- `/whatsapp/*` - WhatsApp endpoints
- `/payments/webhook` - Webhook de pagamentos

### Nível 2: Endpoints Autenticados

```env
THROTTLE_TTL=60000             # 60 segundos
THROTTLE_LIMIT=60              # 60 req/min
```

Limite padrão para usuários autenticados.

## Plan-based Rate Limiting

Valida limites diários e mensais específicos de cada plano.

### Limites por Plano

```
Free:       dailyLimit: 100,   monthlyLimit: 1000
Pro:        dailyLimit: 1000,  monthlyLimit: 30000
Enterprise: dailyLimit: 999999, monthlyLimit: 999999
```

### Implementação

- **Guard:** `PlanLimitGuard` (`src/auth/guards/plan-limit.guard.ts`)
- **Storage:** Redis com chaves:
  - `usage:daily:{userId}:{YYYY-MM-DD}`
  - `usage:monthly:{userId}:{YYYY-MM}`

### Fluxo

1. `AuthMiddleware` carrega plano do usuário
2. `ApiKeyMiddleware` cacheia plano por 3 horas
3. `PlanLimitGuard` valida limites antes de processar
4. Uso é incrementado após sucesso

## Configuração por Ambiente

### Desenvolvimento

```env
THROTTLE_PUBLIC_TTL=60000
THROTTLE_PUBLIC_LIMIT=100
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### Produção

```env
THROTTLE_PUBLIC_TTL=60000
THROTTLE_PUBLIC_LIMIT=20
THROTTLE_TTL=60000
THROTTLE_LIMIT=60
```

## Monitoramento

### Redis Keys

```bash
# Ver uso diário
redis-cli KEYS "usage:daily:*"

# Ver uso mensal
redis-cli KEYS "usage:monthly:*"

# Ver cache de API keys
redis-cli KEYS "apiKey:*"
```

### Logs

```bash
# Verificar rejeições por rate limit
docker-compose logs api | grep "ThrottlerException"

# Verificar limites de plano
docker-compose logs api | grep "limit reached"
```

## Tratamento de Erros

### Global Rate Limit Excedido

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

### Plan Limit Excedido

```json
{
  "statusCode": 403,
  "message": "Daily message limit reached (100)"
}
```

## Boas Práticas

1. **Ajustar limites públicos** conforme carga do servidor
2. **Monitorar Redis** para detectar padrões de uso
3. **Documentar limites** nos planos para usuários
4. **Implementar retry logic** no cliente com backoff exponencial
5. **Usar headers de resposta** para informar limites restantes

## Headers de Resposta

O `ThrottlerGuard` adiciona headers:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1234567890
```

## Proteção contra Brute Force

### Login/Signup (20 req/min)

Limite baixo previne:
- Ataques de força bruta
- Enumeração de usuários
- Spam de registros

### Recomendação

Implementar CAPTCHA após 5 tentativas falhadas.

## Escalabilidade

Para alta concorrência:

```env
# Aumentar limites em produção com load balancer
THROTTLE_PUBLIC_LIMIT=50
THROTTLE_LIMIT=150
```

Usar Redis Cluster para distribuir contadores entre múltiplas instâncias.
