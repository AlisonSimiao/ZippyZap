FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate
RUN bun build src/index.ts --target=bun --compile --outfile=api-bun

EXPOSE 8080

CMD ["./api-bun"]