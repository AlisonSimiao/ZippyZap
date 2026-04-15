# AGENTS.md

## Repository Structure

```
zapi/
├── backend/
│   ├── api-bun/       # Bun + Elysia API (single unified backend)
│   └── DOCKER/        # Docker Compose (Postgres, Redis, WuzAPI, api-bun)
├── web/               # Next.js 15 frontend (App Router)
└── wuzapi/            # Gitignored — external WuzAPI binary/config
```

**The old `backend/api` (NestJS) and `backend/wss` are gone.** The entire backend is now a single Bun + Elysia service in `backend/api-bun`. References to NestJS, BullMQ, or `backend/wss` in `.agent/workflows/` and `README.md` are stale.

## Backend (`backend/api-bun`)

- **Runtime**: Bun (not Node.js). Use `bun` for all commands, not `yarn`/`npm`.
- **Framework**: Elysia (not NestJS). No decorators/modules — plain functional route files in `src/routes/`.
- **Job queues**: Redis Streams via `src/streams/` (replaced BullMQ). Producer: `addJob()`. Consumer: `StreamConsumer` class with XREADGROUP.
- **WhatsApp**: Calls external WuzAPI service over HTTP (`src/services/wuzapi.ts`) with retry + circuit breaker. No direct Baileys/WPPConnect dependency.
- **Path alias**: `@/*` maps to `./src/*` (tsconfig paths).
- **Prisma 6**: `binaryTargets` includes `linux-musl-openssl-3.0.x` for Alpine Docker. Pin confirmed in `.vscode/settings.json`.
- **Build output**: `bun build` compiles to a single native binary `./api-bun`.

### Commands (run from `backend/api-bun/`)

```bash
bun run dev              # Watch mode dev server
bun run build            # Compile to native binary ./api-bun
bun run start            # Run compiled binary

bun run db:generate      # Prisma generate (required after schema changes)
bun run db:migrate       # Prisma migrate dev
bun run db:seed          # Seed plans, events, admin user
bun run db:studio        # Prisma Studio GUI
```

### Testing

Tests use a **separate SQLite schema** (`prisma/schema.test.prisma`) to avoid needing PostgreSQL.

```bash
bun run test:setup       # One-time: generate test client + push SQLite schema
bun run test             # Fast tests (utils + health only)
bun run test:all         # All tests (some need Redis running)
bun test tests/auth.test.ts  # Single test file
```

- `tests/setup.ts` provides `prisma`, `cleanupDatabase()`, `seedTestData()`.
- `tests/global-setup.ts` runs cleanup + seed in `beforeAll`.
- Test DB location: `prisma/test-db/test.db`.
- Tests requiring Redis: `health.test.ts`, `auth.test.ts`, `api-keys.test.ts`, `whatsapp.test.ts`, `rate-limit.test.ts`.

### Required env vars (startup fails without these)

`DATABASE_URL`, `JWT_SECRET`, `MP_WEBHOOK_SECRET`, `MP_ACCESS_TOKEN`

See `.env.example` for full list including `WUZAPI_*`, `REDIS_*`, `THROTTLE_*`, `ADMIN_EMAILS`.

### Key architecture details

- **Entrypoint**: `src/index.ts` validates env, starts Elysia app, starts stream workers.
- **App wiring**: `src/app.ts` — decorates `prisma` and `redis` into Elysia context, mounts all route groups.
- **Workers**: `src/workers/index.ts` starts 4 stream consumers (send-message, create-user, session-logout, webhook) + a 30s status-check interval + daily log cleanup.
- **Middleware**: `src/middleware/` — `jwt.ts` (auth + request logger), `api-key.ts`, `rate-limit.ts`, `plan-limit.ts`, `admin.ts`.
- **Swagger**: Available at `/swagger` in dev.

### Redis key patterns

- `user:{userId}:status` — WhatsApp connection status (`connected`/`disconnected`)
- `user:{userId}:qrcode` — QR code JSON with 60s TTL
- `apiKey:{hash}` — cached API key data (3h TTL)
- `webhook:{userId}` — cached webhook URL + API key (4h TTL)
- Streams: `streams:send-message`, `streams:create-user`, `streams:session-logout`, `streams:webhook`

## Frontend (`web/`)

- **Next.js 15** with App Router, React 19, **Tailwind CSS v4**.
- **Auth**: NextAuth v4 with credentials provider (`lib/auth.ts`). JWT strategy, login page at `/login`.
- **UI**: shadcn/ui (new-york style) + Radix primitives + Lucide icons.
- **API client**: Singleton axios class in `lib/api.ts`, uses `NEXT_PUBLIC_API_HOST` env var.
- **Data fetching**: TanStack React Query v5.
- **Route groups**: `(private)/` for authenticated pages (dashboard, checkout), public pages at root (landing, login, signup, docs).
- **Build config**: ESLint and TypeScript errors are **ignored during build** (`next.config.mjs`). Don't rely on `next build` for type checking.

### Commands (run from `web/`)

```bash
yarn dev                 # Dev server (port 3000)
yarn build               # Production build
yarn lint                # ESLint
```

### Env vars

```
NEXT_PUBLIC_APP_URL      # e.g. https://zippyzap.online
NEXT_PUBLIC_API_URL      # e.g. https://api.zippyzap.online
```

Note: `lib/api.ts` reads `NEXT_PUBLIC_API_HOST` (not `NEXT_PUBLIC_API_URL`). Check `.env.local` for the actual var name used.

## Docker / Infrastructure

`backend/DOCKER/docker-compose.yml` runs 4 services:
- `api-bun` — builds from `backend/api-bun/Dockerfile`
- `wuzapi` — `asternic/wuzapi` image (WhatsApp engine, listens on container port 8080, mapped to host 8082)
- `postgres` — PostgreSQL 15
- `redis` — Redis 7 Alpine

WuzAPI env vars (`WUZAPI_ADMIN_TOKEN`, `WUZAPI_GLOBAL_ENCRYPTION_KEY`, etc.) come from `backend/DOCKER/.env`.

## Development (all services)

```bash
./dev.sh                 # Starts api-bun + frontend (dev.sh still references backend/wss but it no longer exists)
```

`dev.sh` is outdated — it tries to start `backend/wss` which doesn't exist. For local dev, start services manually:

```bash
# Terminal 1: Docker services
cd backend/DOCKER && docker compose up postgres redis wuzapi

# Terminal 2: API
cd backend/api-bun && bun run dev

# Terminal 3: Frontend
cd web && yarn dev
```

## Deployment

GitHub Actions (`.github/workflows/prod.yaml`) deploys on push to `main`:
1. SCP syncs repo to VPS at `/home/ubuntu/zap`
2. SSH runs `docker compose down && docker compose up -d --build` in `backend/DOCKER/`

Required GitHub secrets: `VPS_IP`, `VPS_USER`, `VPS_SSH_KEY`.

## Database

- PostgreSQL via Prisma ORM. Schema: `backend/api-bun/prisma/schema.prisma`.
- After schema changes: `bun run db:migrate` then `bun run db:generate`.
- Seed creates 3 plans (Gratuito/Basico/Premium), 6 webhook events, and an admin user.
- Models: User, ApiKey, Plan, Message, Payment, Subscription, Webhook, Event, WebhookEvent, WebhookLog, RequestLog.
