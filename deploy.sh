#!/bin/bash

# Build frontend
echo "Building frontend..."
npm run build

# Create deployment directory on VPS
ssh -i ~/.ssh/id_ed25519 root@147.93.58.192 "mkdir -p /var/www/cosmic-nexus/{frontend,backend}"

# Copy frontend build to VPS
echo "Deploying frontend..."
scp -i ~/.ssh/id_ed25519 -r dist/* root@147.93.58.192:/var/www/cosmic-nexus/frontend/

# Copy backend files to VPS
echo "Deploying backend..."
cd server
npm run build
scp -i ~/.ssh/id_ed25519 -r package.json .env dist/* root@147.93.58.192:/var/www/cosmic-nexus/backend/

# Setup and start the application on VPS
ssh -i ~/.ssh/id_ed25519 root@147.93.58.192 "bash -s" << 'EOF'
cd /var/www/cosmic-nexus/backend
npm install --production

# Gracefully stop the existing service if running
systemctl stop cosmic-nexus 2>/dev/null || true

# Create systemd service for the backend
cat > /etc/systemd/system/cosmic-nexus.service << 'SERVICE'
[Unit]
Description=Cosmic Nexus Backend Service
After=network.target mongod.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/cosmic-nexus/backend
Environment=PORT=5000
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
SERVICE

# Setup nginx configuration
cat > /etc/nginx/sites-available/cosmic-nexus << 'NGINX'
server {
    listen 80;
    server_name csmcl.space;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name csmcl.space;

    ssl_certificate /etc/letsencrypt/live/csmcl.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/csmcl.space/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS (uncomment if you're sure)
    # add_header Strict-Transport-Security "max-age=63072000" always;

    # Frontend
    location / {
        root /var/www/cosmic-nexus/frontend;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
NGINX

# Enable the site
ln -sf /etc/nginx/sites-available/cosmic-nexus /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Set proper permissions
chown -R www-data:www-data /var/www/cosmic-nexus

# Reload services
systemctl daemon-reload

# Restart services gracefully
systemctl restart cosmic-nexus
nginx -t && systemctl reload nginx

# Show status
systemctl status cosmic-nexus
systemctl status nginx
EOF
