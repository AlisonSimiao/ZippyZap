# AGENTS.md

## Repository Structure

```
zapi/
├── backend/
│   ├── api/          # NestJS REST API (main backend)
│   ├── wss/          # WebSocket Service (WhatsApp sessions)
│   └── DOCKER/       # Docker Compose for PostgreSQL + Redis
├── web/              # Frontend (Next.js)
└── wuzapi/           # External WhatsApp integration
```

## Key Commands

### Backend API
```bash
cd backend/api
yarn start:dev          # Development server (watch mode)
yarn build && yarn start:prod  # Production
yarn prisma migrate dev  # Run migrations
yarn prisma generate    # Generate Prisma client
yarn prisma studio      # Database GUI
yarn prisma db seed     # Seed database
yarn lint               # Lint code
yarn test               # Run tests
```

### Backend WSS (WebSocket Service)
```bash
cd backend/wss
yarn start:dev
```

### Frontend
```bash
cd web
yarn dev
yarn build
yarn lint
```

### Development (all services)
```bash
./dev.sh   # Starts API, WSS, and frontend concurrently
```

## Database

- PostgreSQL via Prisma ORM in `backend/api`
- Always run `yarn prisma generate` after `prisma migrate dev`
- Seed file: `backend/api/prisma/seed.ts`

## External Services

- **Redis**: Used by BullMQ for job queues
- **MercadoPago**: Payment integration
- **WhatsApp Business API**: Message sending via WSS

## Environment Files

```bash
cp backend/api/.env.example backend/api/.env
cp web/.env.example web/.env
```

## Deployment

Automatic via GitHub Actions on push to `main` branch. Requires:
- `VPS_IP`, `VPS_USER`, `VPS_SSH_KEY` secrets in GitHub
