# Rate Limiting - Mudanças Implementadas

## 📋 Resumo

Implementadas melhorias no sistema de rate limiting com proteção contra DDoS em endpoints públicos.

## 🔧 Arquivos Criados

### 1. `src/config/throttle.config.ts`
- Configuração dinâmica com dois níveis de throttling
- **Nível 1 (Público):** Limite mais restritivo para endpoints públicos
- **Nível 2 (Geral):** Limite padrão para endpoints autenticados
- Variáveis de ambiente customizáveis

**Variáveis de Ambiente:**
```env
THROTTLE_PUBLIC_TTL=60000      # Janela de tempo para públicos (ms)
THROTTLE_PUBLIC_LIMIT=20       # Limite de requisições para públicos
THROTTLE_TTL=60000             # Janela de tempo geral (ms)
THROTTLE_LIMIT=60              # Limite de requisições geral
```

### 2. `src/auth/guards/throttle.guard.ts`
- Guard customizado que estende `ThrottlerGuard`
- Aplica throttling a TODOS os endpoints
- Proteção contra DDoS em endpoints públicos

## 📝 Arquivos Modificados

### 1. `src/app.module.ts`
- Importa `CustomThrottlerGuard` e `getThrottleConfig`
- Usa `ThrottlerModule.forRoot(getThrottleConfig())`
- Substitui `ThrottlerGuard` por `CustomThrottlerGuard`

### 2. `src/auth/auth.middleware.ts`
- Carrega `Plan` do usuário para `PlanLimitGuard`

### 3. `.env.example`
- Adiciona variáveis de throttling público e geral

## 🎯 Proteção contra DDoS

### Endpoints Públicos (20 req/min)
- `/auth/signup` - Registro
- `/auth/signin` - Login
- `/plans` - Listar planos
- `/health` - Health check
- `/webhooks/*` - Webhooks
- `/whatsapp/*` - WhatsApp
- `/payments/webhook` - Webhook de pagamentos

### Endpoints Autenticados (60 req/min)
- Todos os demais endpoints com autenticação

## 🚀 Como Usar

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

## 📊 Estratégia em Camadas

1. **CustomThrottlerGuard** - Proteção global contra DDoS
2. **PlanLimitGuard** - Limites diários/mensais por plano
3. **ApiKeyMiddleware** - Cache de plano (3 horas)

## ⚠️ Notas Importantes

- Endpoints públicos têm limite 3x menor que autenticados
- `skipSuccessfulRequests: false` - Conta requisições bem-sucedidas
- `skipFailedRequests: false` - Conta requisições falhadas
- Proteção contra brute force em login/signup
