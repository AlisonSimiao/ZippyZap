# Testes - ZippyZap API (Bun)

Este diretório contém os testes para o api-bun.

## Estrutura

```
tests/
├── setup.ts           # Configuração global e utilitários de teste
├── setup-db.ts       # Script para configurar banco SQLite de teste
├── health.test.ts     # Testes das rotas de health
├── auth.test.ts       # Testes de autenticação
├── plans.test.ts      # Testes de planos
├── api-keys.test.ts   # Testes de API Keys
├── whatsapp.test.ts   # Testes de WhatsApp
├── webhooks.test.ts   # Testes de webhooks
├── payments.test.ts   # Testes de pagamentos
├── rate-limit.test.ts # Testes de rate limiting
└── utils.test.ts      # Testes de funções utilitárias
```

## Requisitos

- Bun 1.x
- Redis (para testes de health)

## Configuração do Banco de Testes

### SQLite (Recomendado para testes)

```bash
# Gerar Prisma client para teste
bun run db:generate:test

# Criar banco SQLite
bun run db:push:test

# Setup completo
bun run test:setup
```

O banco SQLite será criado em: `prisma/test-db/test.db`

### Variáveis de Ambiente

```bash
# Para SQLite (testes)
TEST_DATABASE_URL="file:./prisma/test-db/test.db"
```

## Executar Testes

### Todos os testes
```bash
bun test
```

### Testes unitários (sem banco de dados)
```bash
bun test tests/utils.test.ts
```

### Testes de health (requer Redis)
```bash
bun test tests/health.test.ts
```

### Testes específicos
```bash
bun test tests/plans.test.ts
bun test tests/auth.test.ts
```

## Testes Disponíveis

| Arquivo | Descrição | Dependências |
|---------|-----------|--------------|
| `utils.test.ts` | Funções utilitárias puras | Nenhuma |
| `health.test.ts` | Rotas de health | Redis |
| `auth.test.ts` | Signup, signin | DB + Redis |
| `plans.test.ts` | Listar planos | DB |
| `api-keys.test.ts` | CRUD de API keys | DB + Redis |
| `whatsapp.test.ts` | Session, QR, status | DB + Redis |
| `webhooks.test.ts` | CRUD webhooks | DB |
| `payments.test.ts` | Payments | DB |
| `rate-limit.test.ts` | Limites de rate | Redis |

## Testes Rápidos (sem banco de dados)

```bash
bun test tests/utils.test.ts
```

## Status Atual

```
✅ 19 tests passing (utils + health)
```

## Dicas

1. Para testes rápidos sem dependências externas:
   ```bash
   bun test tests/utils.test.ts
   ```

2. Para ver logs detalhados:
   ```bash
   bun test --verbose
   ```

3. Para rodar um teste específico:
   ```bash
   bun test tests/utils.test.ts --test-name-pattern="Phone"
   ```
