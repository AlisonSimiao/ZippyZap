# 📊 Análise Detalhada: Lógica de Limites de Planos e Rate Limiting

## 📋 Resumo Executivo

O sistema implementa **3 camadas de proteção**:

1. **Global Rate Limiting** (ThrottlerGuard) - Proteção contra DDoS
2. **Plan-based Rate Limiting** (PlanLimitGuard) - Limites diários/mensais por plano
3. **Session Limiting** (UserService) - 1 sessão WhatsApp ativa por usuário

---

## 1️⃣ CAMADA 1: Global Rate Limiting (ThrottlerGuard)

### Localização
- [src/auth/guards/throttle.guard.ts](src/auth/guards/throttle.guard.ts)
- [src/config/throttle.config.ts](src/config/throttle.config.ts)
- [src/app.module.ts](src/app.module.ts)

### Configuração

```typescript
// src/config/throttle.config.ts
export const getThrottleConfig = (): ThrottleConfig[] => {
  const globalTtl = parseInt(process.env.THROTTLE_TTL || '60000', 10);
  const globalLimit = parseInt(process.env.THROTTLE_LIMIT || '60', 10);
  const publicTtl = parseInt(process.env.THROTTLE_PUBLIC_TTL || '60000', 10);
  const publicLimit = parseInt(process.env.THROTTLE_PUBLIC_LIMIT || '20', 10);

  return [
    {
      ttl: publicTtl,        // 60 segundos (público)
      limit: publicLimit,    // 20 req/min
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    {
      ttl: globalTtl,        // 60 segundos (geral)
      limit: globalLimit,    // 60 req/min
    },
  ];
};
```

### Limites Padrão

| Contexto | TTL | Limite | Endpoints |
|----------|-----|--------|-----------|
| **Público** | 60s | 20 req/min | `/auth/signup`, `/auth/signin`, `/plans`, `/health`, `/webhooks/*`, `/payments/webhook` |
| **Autenticado** | 60s | 60 req/min | Todos os demais |

### Estratégia de Proteção

✅ **Dois níveis**: Público (mais restritivo) + Geral (menos restritivo)
✅ **Conta requições bem/mal sucedidas**: `skipSuccessfulRequests: false`
✅ **Proteção contra brute force**: Limite baixo em login/signup
✅ **Headers informativos**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Erro Retornado
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

---

## 2️⃣ CAMADA 2: Plan-based Rate Limiting (PlanLimitGuard)

### Localização
[src/auth/guards/plan-limit.guard.ts](src/auth/guards/plan-limit.guard.ts)

### Estrutura de Dados - Planos

**Seed em**: [prisma/seed.ts](prisma/seed.ts)

```typescript
const plans = [
  {
    name: 'Gratuito',
    dailyLimit: 50,
    monthlyLimit: 1500,
    sessionLimit: 1,
    price: 0,
  },
  {
    name: 'Básico',
    dailyLimit: 2500,
    monthlyLimit: 50000,
    sessionLimit: 1,
    price: 39.9,
  },
  {
    name: 'Premium',
    dailyLimit: 999999999,      // ≈ Ilimitado
    monthlyLimit: 999999999,    // ≈ Ilimitado
    sessionLimit: 1,
    price: 99.9,
  },
];
```

### Fluxo de Verificação (PlanLimitGuard)

```
Request → PlanLimitGuard.canActivate()
  │
  ├─ Extrai userId (JWT ou API Key)
  │
  ├─ Busca Plan (otimizado com cache)
  │  └─ Via ApiKeyMiddleware (cache 3h) OU direto do Prisma
  │
  ├─ Valida Limite Diário
  │  ├─ Redis key: `usage:daily:{userId}:YYYY-MM-DD`
  │  ├─ Se usage >= limit: 403 Forbidden
  │  └─ Se skip 999999: Permite
  │
  ├─ Valida Limite Mensal
  │  ├─ Redis key: `usage:monthly:{userId}:YYYY-MM`
  │  ├─ Se usage >= limit: 403 Forbidden
  │  └─ Se skip 999999: Permite
  │
  └─ ✅ Passa para próxima etapa
```

### Código de Verificação

```typescript
// src/auth/guards/plan-limit.guard.ts
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  const user = request.user;
  const apiKey = request.apiKey;
  const userId = user?.id || apiKey?.userId;

  // ✅ Otimização: Cache de plano via ApiKeyMiddleware
  if (apiKey?.User?.Plan) {
    dailyLimit = apiKey.User.Plan.dailyLimit;
    monthlyLimit = apiKey.User.Plan.monthlyLimit;
  } else {
    // Busca do Prisma se não está em cache
    const userWithPlan = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { Plan: true },
    });
  }

  // ❌ Rejeita se limite foi atingido
  if (dailyUsage && parseInt(dailyUsage) >= dailyLimit) {
    throw new ForbiddenException(
      `Daily message limit reached (${dailyLimit})`
    );
  }

  // ⚠️ Problema: Sempre pula plano ilimitado (999999)
  if (dailyLimit > 0 && dailyLimit < 999999) {
    // Verifica Redis
  }

  return true;
}
```

### Erro Retornado
```json
{
  "statusCode": 403,
  "message": "Daily message limit reached (50)"
}
```

---

## 3️⃣ CAMADA 3: Session Limiting

### Localização
[src/user/user.service.ts](src/user/user.service.ts) - `createWhatsAppSession()`

### Lógica de Limite de Sessão

```typescript
async createWhatsAppSession(idUser: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      Plan: {
        select: {
          name: true,
          sessionLimit: true,  // 1 para todos os planos
        },
      },
    },
  });

  const currentStatus = await this.redisService.get(`user:${idUser}:status`);

  // ❌ Se já tem sessão ativa E plano permite apenas 1
  if (currentStatus && currentStatus !== 'disconnected') {
    if (user.Plan.sessionLimit === 1) {
      throw new ConflictException(
        `Limite de sessões atingido. Seu plano "${user.Plan.name}" permite apenas ${user.Plan.sessionLimit} sessão ativa.`
      );
    }
  }

  return true;
}
```

### Erro Retornado
```json
{
  "statusCode": 409,
  "message": "Limite de sessões atingido. Seu plano \"Gratuito\" permite apenas 1 sessão ativa. Status atual: connected"
}
```

---

## 4️⃣ INCREMENTO DE USO

### Localização
[src/whatsapp/whatsapp.controller.ts](src/whatsapp/whatsapp.controller.ts) - POST `/send`

### Código de Incremento

```typescript
// Após enviar mensagem com sucesso
const today = format(new Date(), 'yyyy-MM-dd');
const month = format(new Date(), 'yyyy-MM');
const dailyKey = `usage:daily:${userId}:${today}`;
const monthlyKey = `usage:monthly:${userId}:${month}`;

// Incrementa contador diário
const dailyCount = await this.redis.incr(dailyKey);
if (dailyCount === 1) {
  await this.redis.expire(dailyKey, 86400 * 2);  // 2 dias TTL
}

// Incrementa contador mensal
const monthlyCount = await this.redis.incr(monthlyKey);
if (monthlyCount === 1) {
  await this.redis.expire(monthlyKey, 86400 * 35);  // 35 dias TTL
}
```

### Chaves Redis

```
usage:daily:1:2026-01-31       → "50"   (50 mensagens hoje)
usage:daily:1:2026-02-01       → "0"    (novo dia)
usage:monthly:1:2026-01        → "1500" (1500 no mês)
usage:monthly:1:2026-02        → "0"    (novo mês)
```

---

## 5️⃣ OTIMIZAÇÃO: ApiKeyMiddleware Cache

### Localização
[src/api-key/api-key.middleware.ts](src/api-key/api-key.middleware.ts)

### Estratégia de Cache

```typescript
async use(req: Request, res: Response, next: () => void) {
  const hash = req.headers['x-api-key'] as string;

  // 1️⃣ Tenta encontrar em Redis (3 horas de cache)
  let apiKey = await this.redis.get(`apiKey:${hash}`)
    .then((json: string) => {
      if (!json) return null;
      return JSON.parse(json) as CachedApiKey;  // Cache hit ✅
    });

  // 2️⃣ Se não encontrar, busca no Prisma
  if (!apiKey) {
    apiKey = await this.prisma.apiKey.findUnique({
      where: { hash, status: EStatusApiKey.ACTIVE },
      select: {
        id: true,
        userId: true,
        User: {
          select: { Plan: true }  // ⭐ Inclui plano!
        },
      },
    });

    // 3️⃣ Cacheia por 3 horas
    await this.redis.setWithExpiration(
      `apiKey:${hash}`,
      JSON.stringify(apiKey),
      60 * 60 * 3
    );
  }

  req.apiKey = apiKey;
  next();
}
```

### Benefício
✅ **Reduz queries ao Prisma** em 99.9% dos casos (cache hit)
✅ **PlanLimitGuard tira plano direto do cache**
✅ **TTL de 3 horas** balanceia performance vs. atualização

---

## 6️⃣ PROBLEMAS IDENTIFICADOS

### 🔴 PROBLEMA 1: Incremento Não Validado

**Localização**: [src/whatsapp/whatsapp.controller.ts](src/whatsapp/whatsapp.controller.ts#L45-L55)

**Problema**: O incremento ocorre DEPOIS da validação do PlanLimitGuard, mas se a requisição falhar no envio, o contador ainda foi incrementado.

```typescript
@Post('send')
@UseGuards(PlanLimitGuard)  // ✅ Valida limite
async sendMessage(...) {
  await this.whatsappService.sendMessage(...);  // ❌ Pode falhar aqui
  
  // Incrementa MESMO SE FALHAR ACIMA
  const dailyCount = await this.redis.incr(dailyKey);
}
```

**Impacto**: 
- ❌ Usuário perde quota por requisição falhada
- ❌ Pode esgotar limite mensal com erros

**Solução Recomendada**:
```typescript
try {
  await this.whatsappService.sendMessage(...);
  
  // Só incrementa se sucesso
  await this.redis.incr(dailyKey);
  await this.redis.incr(monthlyKey);
  
  return { message: 'Mensagem enviada' };
} catch (error) {
  // ✅ Não incrementa
  throw error;
}
```

---

### 🔴 PROBLEMA 2: Sem Controle de Expiração Automática

**Localização**: [src/whatsapp/whatsapp.controller.ts](src/whatsapp/whatsapp.controller.ts#L49-L52)

**Problema**: TTL é setado apenas se `dailyCount === 1` (primeira requisição do dia). Se alguém deletar a chave, a próxima requisição não setará TTL novamente.

```typescript
const dailyCount = await this.redis.incr(dailyKey);
if (dailyCount === 1) {  // ⚠️ Só na primeira
  await this.redis.expire(dailyKey, 86400 * 2);
}
// Se alguém fizer DEL usage:daily:1:2026-01-31
// A próxima requisição vai criar a chave SEM TTL
```

**Solução Recomendada**:
```typescript
// Usar INCR com TTL automático
await this.redis.incrWithExpiry(dailyKey, 86400 * 2);
await this.redis.incrWithExpiry(monthlyKey, 86400 * 35);
```

---

### 🔴 PROBLEMA 3: Sem Validação de Atualização de Plano

**Localização**: [src/auth/guards/plan-limit.guard.ts](src/auth/guards/plan-limit.guard.ts#L35-L45)

**Problema**: Se usuário muda de plano (de Gratuito para Premium), o cache de API Key continua com o plano antigo por até 3 horas.

```typescript
// Usuário muda de Gratuito para Premium
// Mas cache ainda tem Gratuito (50 msgs/dia)
// PlanLimitGuard bloqueia em 50, ignorando Premium (∞)
```

**Impacto**:
- ❌ Usuário não consegue usar novo plano por até 3 horas
- ❌ Experiência frustrante pós-pagamento

**Solução Recomendada**:
```typescript
// No webhook de pagamento aprovado:
// Invalidar cache da API Key imediatamente
await this.redis.delete(`apiKey:${apiKeyHash}`);

// Ou reduzir TTL para 1 hora:
await this.redis.setWithExpiration(..., 60 * 60 * 1);
```

---

### 🔴 PROBLEMA 4: Sem Resgate de Limite (No Reset Manual)

**Localização**: Inexistente

**Problema**: Não há endpoint para:
- Resetar contadores manualmente (admin)
- Ver uso detalhado por dia/mês
- Solicitar aumento de limite (urgente)

**Impacto**:
- ❌ Usuário com problema não consegue fazer nada
- ❌ Suporte tem que acessar Redis manualmente
- ❌ Sem auditoria de resets

**Solução Recomendada**:
```typescript
// Admin pode resetar uso de um usuário
@Post('admin/reset-usage/:userId')
@UseGuards(AdminGuard)
async resetUsage(@Param('userId') userId: number) {
  await this.redis.delete(`usage:daily:${userId}:*`);
  await this.redis.delete(`usage:monthly:${userId}:*`);
  
  // Log no banco (auditoria)
  await this.auditService.log({
    action: 'RESET_USAGE',
    userId,
    resetBy: req.user.id,
  });
}
```

---

### 🟡 PROBLEMA 5: Session Limit vs Daily Limit Confuso

**Localização**: 
- [prisma/schema.prisma](prisma/schema.prisma) - sessionLimit
- [src/user/user.service.ts](src/user/user.service.ts) - createWhatsAppSession()
- [src/auth/guards/plan-limit.guard.ts](src/auth/guards/plan-limit.guard.ts) - dailyLimit

**Problema**: 
- `sessionLimit` = Quantas WhatsApp sessions simultâneas (sempre 1)
- `dailyLimit` = Quantas mensagens por dia
- **Estão em contextos diferentes mas podem confundir**

```typescript
// Isso é confuso
Plan {
  sessionLimit: 1,      // WhatsApp
  dailyLimit: 50,       // Mensagens
  monthlyLimit: 1500,   // Mensagens
}
```

**Sugestão de Nomenclatura**:
```typescript
Plan {
  whatsappSessionLimit: 1,        // ✅ Claro
  dailyMessageLimit: 50,          // ✅ Claro
  monthlyMessageLimit: 1500,      // ✅ Claro
  webhookCallsLimit: 10000,       // 🔮 Futuro
  apiCallsLimit: 1000000,         // 🔮 Futuro
}
```

---

### 🟡 PROBLEMA 6: Sem Rate Limit por Endpoint

**Localização**: [src/config/throttle.config.ts](src/config/throttle.config.ts)

**Problema**: Todos endpoints autenticados têm o mesmo limite (60 req/min). Mas:
- `/whatsapp/send` deveria ter limite diferente de `/user/get`
- Endpoints caros (enviar mensagem) usam mesmo limite que leitura

**Impacto**:
- ❌ Um usuário spamming `/whatsapp/send` afeta outros users
- ❌ Sem proteção para operações caras

**Solução Recomendada**:
```typescript
// @UseGuards(PlanLimitGuard, EndpointThrottlerGuard)
// com decorador @Throttle(100, 60)

@Post('send')
@Throttle(100, 60)  // 100 req/min (mais generoso)
async sendMessage() { }

@Get('status')
@Throttle(500, 60)  // 500 req/min (leitura rápida)
async getStatus() { }
```

---

## 7️⃣ FLUXO COMPLETO DE UMA REQUISIÇÃO

```
POST /whatsapp/send
│
├─ 1. CustomThrottlerGuard (Global Rate Limit)
│  └─ ✅ 60 req/min (autenticado)
│
├─ 2. AuthMiddleware
│  └─ ✅ Extrai JWT e adiciona req.user
│
├─ 3. PlanLimitGuard
│  ├─ Busca Plan (cache ApiKeyMiddleware)
│  ├─ Redis: GET usage:daily:1:2026-01-31
│  ├─ Compara: 49 < 50 ✅ OK
│  └─ Permite continuar
│
├─ 4. Controller: sendMessage()
│  ├─ WhatsappService.sendMessage(...) 
│  │  └─ Envia para fila BullMQ
│  │
│  ├─ Redis: INCR usage:daily:1:2026-01-31  (49 → 50)
│  ├─ Redis: INCR usage:monthly:1:2026-01   (1499 → 1500)
│  │
│  └─ Return { message: 'Enviado' }
│
└─ 200 OK
```

---

## 8️⃣ RECOMENDAÇÕES DE MELHORIA

### Priority 1 (Crítico)

- [ ] **Mover incremento dentro de try-catch** (Problema 1)
- [ ] **Garantir TTL em toda operação INCR** (Problema 2)
- [ ] **Invalidar cache ao mudar de plano** (Problema 3)

### Priority 2 (Alto)

- [ ] **Criar endpoints de admin** para reset de uso
- [ ] **Adicionar endpoint de uso detalhado** (`/dashboard/usage?date=2026-01-31`)
- [ ] **Implementar rate limit por endpoint** com decorador `@Throttle()`
- [ ] **Renomear campos** para melhor clareza (sessionLimit → whatsappSessionLimit)

### Priority 3 (Médio)

- [ ] **Adicionar webhook de limite atingido** (alerta pró-ativo)
- [ ] **Implementar upgrade de limite urgente** (página especial)
- [ ] **Monitoramento em tempo real** no dashboard (bars com porcentagem)
- [ ] **Testes E2E** de limites

### Priority 4 (Baixo)

- [ ] **Análise de uso detalhada** por dia/hora
- [ ] **Gráficos de tendência** no dashboard
- [ ] **Limites customizados por endpoint** no admin
- [ ] **Webhooks de limite aviso** (80%, 90%, 100%)

---

## 9️⃣ TESTES RECOMENDADOS

### Teste 1: Limite Diário
```bash
# 50 mensagens (limite Gratuito)
for i in {1..50}; do
  curl -X POST http://localhost:8080/whatsapp/send \
    -H "x-api-key: <key>" \
    -d '{"phone":"...", "text":"..."}'
done

# Requisição 51 deve retornar 403
curl -X POST http://localhost:8080/whatsapp/send \
  -H "x-api-key: <key>" \
  -d '{"phone":"...", "text":"..."}'
# Expected: 403 Forbidden - Daily message limit reached (50)
```

### Teste 2: Cache de Plano
```bash
# 1. Verificar plano em cache
redis-cli GET apiKey:<hash>

# 2. Mudar de plano (Gratuito → Premium)
# 3. Tentar enviar 500 mensagens
# ❌ Deve bloquear em 50 até cache expirar
```

### Teste 3: Session Limit
```bash
# Requisição 1: Criar sessão
POST /whatsapp/session

# Requisição 2: Tentar criar outra sessão (mesmo usuário)
# Expected: 409 Conflict - Limite de sessões atingido
```

---

## 🔟 CONCLUSÃO

### ✅ O Que Está Bom
- Sistema em 3 camadas bem estruturado
- Cache inteligente com TTL apropriado
- Proteção contra DDoS e brute force
- Incremento após validação (maioria dos casos)

### ❌ O Que Precisa Melhorar
1. Incremento não transacional (falha silenciosa)
2. TTL não garantido em 100% dos casos
3. Cache pode estar desatualizado após upgrade
4. Sem endpoints de administração
5. Sem distinção de limite por endpoint

### 🎯 Próximas Ações
1. **Imediato**: Corrigir Problema 1 e 2
2. **Curto prazo**: Implementar Problema 3 e endpoints admin
3. **Médio prazo**: Adicionar rate limit por endpoint
4. **Longo prazo**: Dashboard avançado e webhooks

