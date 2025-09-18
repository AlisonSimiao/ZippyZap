#!/bin/bash

echo "🔧 Configurando Let's Encrypt para zippy-zap.duckdns.org..."

# Parar containers
docker compose down

# Criar diretórios
mkdir -p ssl certbot/www certbot/conf

# Certificado temporário
openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
    -keyout ssl/privkey.pem \
    -out ssl/fullchain.pem \
    -subj "/C=BR/ST=SP/L=SP/O=ZAPI/CN=zippy-zap.duckdns.org"

# Iniciar apenas nginx
docker compose up -d proxy

echo "⏳ Aguardando nginx iniciar..."
sleep 5

# Obter certificado Let's Encrypt
echo "🔐 Obtendo certificado Let's Encrypt..."
docker compose run --rm certbot

if [ $? -eq 0 ]; then
    echo "✅ Certificado obtido! Copiando para nginx..."
    docker compose exec proxy cp /etc/letsencrypt/live/zippy-zap.duckdns.org/fullchain.pem /etc/nginx/ssl/
    docker compose exec proxy cp /etc/letsencrypt/live/zippy-zap.duckdns.org/privkey.pem /etc/nginx/ssl/
    docker compose restart proxy
    echo "🎉 Let's Encrypt configurado com sucesso!"
else
    echo "❌ Falha no Let's Encrypt. Usando certificado auto-assinado."
fi

# Iniciar todos os serviços
docker compose up -d