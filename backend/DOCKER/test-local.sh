#!/bin/bash

echo "🧪 Testing ZAPI locally..."

# Navigate to Docker directory
cd "$(dirname "$0")"

# Create directories
mkdir -p ssl

# Generate local self-signed certificate
echo "📜 Generating local SSL certificate..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/privkey.pem \
    -out ssl/fullchain.pem \
    -subj "/C=BR/ST=SP/L=SP/O=ZAPI/CN=localhost"

# Start services
echo "🚀 Starting services..."
docker compose up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Test endpoints
echo "🔍 Testing endpoints..."
echo "HTTP: http://localhost"
curl -s http://localhost || echo "❌ HTTP test failed"

echo "HTTPS: https://localhost (self-signed)"
curl -k -s https://localhost || echo "❌ HTTPS test failed"

echo "✅ Local test complete!"
echo "Access: https://localhost (accept self-signed certificate)"