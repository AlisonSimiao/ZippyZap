FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
ENV DATABASE_URL="postgresql://postgres.tgyyvbbejknsvholpinc:NLpZMVjlLohD2RWG@aws-1-sa-east-1.pooler.supabase.com/postgres?pgbouncer=true"
RUN yarn prisma generate
RUN yarn build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

CMD ["node", "dist/src/main"]
