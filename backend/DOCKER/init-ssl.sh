#!/bin/bash

echo "🔐 Initializing SSL certificates..."

# Create directories
mkdir -p certbot/www certbot/conf ssl

# Stop any running containers
docker compose down

# Start nginx without SSL first
echo "📝 Creating temporary nginx config..."
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

# Backup original config
cp nginx.conf nginx.conf.backup

# Use temp config
cp nginx-temp.conf nginx.conf

# Start services
echo "🚀 Starting services with HTTP only..."
docker compose up -d api proxy

# Wait for nginx to start
sleep 10

# Get certificate
echo "📜 Requesting SSL certificate..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email alison.simiao@gmail.com \
    --agree-tos \
    --no-eff-email \
    -d zippy-zap.duckdns.org

# Copy certificates to ssl directory
echo "📋 Copying certificates..."
docker cp certbot:/etc/letsencrypt/live/zippy-zap.duckdns.org/fullchain.pem ./ssl/
docker cp certbot:/etc/letsencrypt/live/zippy-zap.duckdns.org/privkey.pem ./ssl/

# Restore original nginx config
echo "🔄 Restoring nginx config with SSL..."
cp nginx.conf.backup nginx.conf

# Restart with SSL
echo "🔄 Restarting with SSL..."
docker compose down
docker compose up -d

echo "✅ SSL setup complete!"
echo "🌐 Your site should now be available at: https://zippy-zap.duckdns.org"