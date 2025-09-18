#!/bin/bash

# Configuration
DOMAIN="zippy-zap.duckdns.org"

# Create directories
mkdir -p ssl

echo "Creating self-signed SSL certificate for $DOMAIN..."

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/privkey.pem \
    -out ssl/fullchain.pem \
    -subj "/C=BR/ST=SP/L=SP/O=ZAPI/CN=$DOMAIN"

echo "✅ Self-signed SSL certificate created successfully!"
echo "Note: For production, configure your domain DNS properly and use Let's Encrypt"