#!/bin/bash

echo "Renewing Let's Encrypt certificate..."

# Renew certificate
docker-compose run --rm certbot renew

if [ $? -eq 0 ]; then
    # Copy renewed certificates
    docker-compose exec proxy cp /etc/letsencrypt/live/zippy-zap.duckdns.org/fullchain.pem /etc/nginx/ssl/
    docker-compose exec proxy cp /etc/letsencrypt/live/zippy-zap.duckdns.org/privkey.pem /etc/nginx/ssl/
    docker-compose restart proxy
    echo "Certificate renewed successfully!"
else
    echo "Certificate renewal failed"
fi