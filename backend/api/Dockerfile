FROM node:20-alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-timeout 300000
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000
RUN npm install --no-audit --no-fund
COPY . .
ENV DATABASE_URL="postgresql://postgres.tgyyvbbejknsvholpinc:NLpZMVjlLohD2RWG@aws-1-sa-east-1.pooler.supabase.com/postgres?pgbouncer=true"
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production \
	DATABASE_URL="postgresql://postgres.tgyyvbbejknsvholpinc:NLpZMVjlLohD2RWG@aws-1-sa-east-1.pooler.supabase.com/postgres?pgbouncer=true" \
	PORT=8080 \
	REDIS_URL= \
	REDIS_HOST=redis-16239.c345.samerica-east1-1.gce.cloud.redislabs.com \
	REDIS_PASS=hS7IyGS2RB6ewjNXLmrH02LMuYWnekqv \
	REDIS_PORT=16239 \
	REDIS_USER=default \
	JWT_SECRET=ksjbjacbajksbcjkab \
	JWT_EXPIRE=8h \
	MP_ACCESS_TOKEN='APP_USR-2522730503541842-112420-0bce678814e4d98a463976b73a96a440-2654936647' \
	FRONTEND_URL=http://localhost:3000 \
	BACKEND_URL=http://localhost:8080 \
	MP_WEBHOOK_SECRET='your-webhook-secret-from-mercadopago' \
	THROTTLE_PUBLIC_TTL=60000 \
	THROTTLE_PUBLIC_LIMIT=20 \
	THROTTLE_TTL=60000 \
	THROTTLE_LIMIT=60

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 8080
CMD ["node", "dist/main"]
