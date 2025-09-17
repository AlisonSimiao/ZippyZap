#!/bin/bash

# Criar diretório SSL
mkdir -p ssl

# Gerar certificado auto-assinado (para desenvolvimento/teste)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=BR/ST=SP/L=SP/O=ZAPI/CN=zippy-zap.duckdns.org"

echo "Certificado SSL criado em ./ssl/"
echo "Para produção, use Let's Encrypt com certbot"