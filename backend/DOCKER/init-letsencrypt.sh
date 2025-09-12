#!/bin/bash

domains=(163.176.233.87)
email="admin@zapi.com"

# Create directories
mkdir -p certbot/conf certbot/www

# Start nginx first
docker-compose up -d proxy

# Get certificate
docker-compose run --rm certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  --email $email \
  --agree-tos \
  --no-eff-email \
  -d ${domains[0]}

# Restart nginx
docker-compose restart proxy