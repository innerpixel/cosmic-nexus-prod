--- Nginx Configuration ---
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name local-dev.test;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name local-dev.test;

    # SSL configuration
    ssl_certificate /etc/nginx/ssl/local.csmcl.space/local.crt;
    ssl_certificate_key /etc/nginx/ssl/local.csmcl.space/local.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_stapling off;

    # Root directory for the application (now pointing to dist)
    root /var/www/local.csmcl-space/dist;

    # Logs
    access_log /var/log/nginx/local-dev.test.access.log;
    error_log /var/log/nginx/local-dev.test.error.log;

    # Security headers (without HSTS)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy for development API server
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy for mail server API
    location /mail/ {
        proxy_pass http://localhost:25/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Handle index.html and routing
    location / {
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Cache settings for static files
    location /assets {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri =404;
    }

    # Disable logging for favicon and robots.txt
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
}
```

--- Backend Service Configuration ---
```systemd
[Unit]
Description=CSMCL Backend Service
After=network.target mongodb.service

[Service]
Type=simple
User=nsbasicus
WorkingDirectory=/home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas/backend
Environment=NODE_ENV=development
Environment=PORT=5000
Environment=MONGODB_URI=mongodb://csmclAdmin:CsmclAdmin2025!@localhost:27017/csmcl?authSource=admin
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

--- MongoDB Configuration ---
```properties
MongoDB Admin User: csmclAdmin
MongoDB Admin Password: CsmclAdmin2025!
MongoDB Database: csmcl
```

--- Hosts Configuration ---
```
127.0.0.1   cosmic-nexus.local
127.0.0.1 local.csmcl.space
127.0.0.1 local-dev.test
```

--- Directory Structure ---
```
Web Root: /var/www/local-dev.test
Project Root: /home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas
```

--- Mail Configuration ---
```properties
Mail Server: localhost
Mail Port: 25
From Address: noreply@local-dev.test
SSL: Enabled (using local certificates)
Certificate Path: /etc/nginx/ssl/local.csmcl.space/local.crt
Certificate Key: /etc/nginx/ssl/local.csmcl.space/local.key
```

--- Git Configuration ---
```
local	/var/git/local.csmcl-space.git (fetch)
local	/var/git/local.csmcl-space.git (push)
production	git@github.com:innerpixel/cosmic-nexus-prod.git (fetch)
production	git@github.com:innerpixel/cosmic-nexus-prod.git (push)
```

--- SELinux Configuration ---
```bash
# For local development, SELinux should be set to permissive mode
# Temporary change (until reboot):
sudo setenforce 0

# Permanent change:
# Edit /etc/selinux/config and set:
# SELINUX=permissive

# Check current status:
sestatus
```

Note: SELinux is set to permissive mode for local development to avoid permission issues with nginx serving files from /var/www/cosmic-nexus/. In production, proper SELinux contexts should be set instead.
