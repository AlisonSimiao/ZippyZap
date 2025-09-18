#!/bin/bash

echo "🔄 Renovando certificados..."

# Tentar renovar Let's Encrypt
docker compose run --rm certbot renew

if [ $? -eq 0 ]; then
    echo "✅ Certificado Let's Encrypt renovado!"
    docker compose exec proxy cp /etc/letsencrypt/live/zippy-zap.duckdns.org/fullchain.pem /etc/nginx/ssl/
    docker compose exec proxy cp /etc/letsencrypt/live/zippy-zap.duckdns.org/privkey.pem /etc/nginx/ssl/
    docker compose restart proxy
else
    echo "❌ Falha na renovação. Gerando novo certificado auto-assinado..."
    ./init-letsencrypt.sh
    docker compose restart proxy
fi