FROM node:20-alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production \
	PORT=8080 \
	REDIS_URL= \
	REDIS_HOST=redis-16239.c345.samerica-east1-1.gce.cloud.redislabs.com \
	REDIS_PASS=hS7IyGS2RB6ewjNXLmrH02LMuYWnekqv \
	REDIS_PORT=16239 \
	REDIS_USER=default \
    WUZAPI_ADMIN_TOKEN=admin \
	WUZAPI_BASE_URL=http://wuzapi:3002 \
	WUZAPI_WEBHOOK_URL=https://api.zippyzap.online/webhooks/wuzapi
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env ./.env.production
CMD ["node", "dist/main"]
