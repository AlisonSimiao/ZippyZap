#!/bin/bash

# DuckDNS Update Script
# Substitua SEU_TOKEN pelo token do DuckDNS
# Substitua zippy-zap pelo seu subdomínio

DOMAIN="zippy-zap"
TOKEN="7bd9bc7d-1b4c-4e07-b5ec-46d440499b58"  # Substitua pelo seu token do DuckDNS
IP="163.176.233.87"

# Atualizar IP
curl "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=${IP}"

echo "DuckDNS updated for ${DOMAIN}.duckdns.org"