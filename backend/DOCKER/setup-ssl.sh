#!/bin/bash

echo "🔐 Setting up SSL for zippy-zap.duckdns.org..."

# Create directories
mkdir -p certbot/www certbot/conf ssl

# Update DuckDNS first
echo "📡 Updating DuckDNS..."
./update-duckdns.sh

# Wait for DNS propagation
echo "⏳ Waiting for DNS propagation..."
sleep 30

# Stop containers
echo "🛑 Stopping containers..."
docker compose down

# Create temporary nginx config for HTTP only
echo "📝 Creating temporary HTTP-only config..."
cat > nginx-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:8080;
    }

    server {
        listen 80;
        server_name zippy-zap.duckdns.org;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            proxy_pass http://api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
EOF

# Backup original config and use temp
cp nginx.conf nginx.conf.backup
cp nginx-temp.conf nginx.conf

# Start services with HTTP only
echo "🚀 Starting services (HTTP only)..."
docker compose up -d api proxy

# Wait for services to start
sleep 15

# Get SSL certificate
echo "📜 Requesting SSL certificate..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@zippy-zap.duckdns.org \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d zippy-zap.duckdns.org

# Check if certificate was created
if [ -d "./certbot/conf/live/zippy-zap.duckdns.org" ]; then
    echo "✅ Certificate obtained successfully!"
    
    # Restore original nginx config with SSL
    echo "🔄 Enabling SSL configuration..."
    cp nginx.conf.backup nginx.conf
    
    # Restart with SSL
    docker compose down
    docker compose up -d
    
    echo "🎉 SSL setup complete!"
    echo "🌐 Your site is now available at: https://zippy-zap.duckdns.org"
else
    echo "❌ Failed to obtain certificate"
    echo "🔄 Restoring HTTP-only configuration..."
    # Keep HTTP-only config if SSL failed
fi

# Cleanup
rm -f nginx-temp.conf