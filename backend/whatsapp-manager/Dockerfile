FROM golang:1.23-alpine AS builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=1 go build -ldflags="-s -w" -o whatsapp-manager ./cmd/server

# ─── Runtime ────────────────────────────────────────────────────────
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app
COPY --from=builder /build/whatsapp-manager .

RUN mkdir -p /app/data

EXPOSE 8090

CMD ["./whatsapp-manager"]
