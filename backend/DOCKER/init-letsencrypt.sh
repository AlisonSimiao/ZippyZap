#!/bin/bash

# Configuration
DOMAIN="zippy-zap.duckdns.org"
EMAIL="alison.simiao@gmail.com"

# Create directories
mkdir -p certbot/www certbot/conf ssl

echo "Setting up SSL for $DOMAIN..."

# Generate temporary self-signed certificate
echo "Creating temporary certificate..."
openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
    -keyout ssl/privkey.pem \
    -out ssl/fullchain.pem \
    -subj "/C=BR/ST=SP/L=SP/O=ZAPI/CN=$DOMAIN"

# Start nginx with temporary certificate
docker-compose up -d proxy

echo "Requesting Let's Encrypt certificate..."

# Request Let's Encrypt certificate
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ Let's Encrypt certificate obtained!"
    # Copy certificates to ssl directory for nginx
    docker-compose exec proxy cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/nginx/ssl/
    docker-compose exec proxy cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/nginx/ssl/
    docker-compose restart proxy
else
    echo "❌ Failed to obtain Let's Encrypt certificate. Using self-signed."
fi

echo "SSL setup complete!"