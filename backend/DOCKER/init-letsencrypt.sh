#!/bin/bash

# Create directories
mkdir -p ssl

# Generate self-signed certificate for IP
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/privkey.pem \
    -out ssl/fullchain.pem \
    -subj "/C=BR/ST=SP/L=SP/O=ZAPI/CN=163.176.233.87"

echo "Self-signed SSL certificate created for IP 163.176.233.87"