# Cosmic Nexus Deployment Guide

This document details the deployment setup for the Cosmic Nexus application, including server configuration, authentication, and maintenance procedures.

## System Architecture

### Overview
- **Frontend**: Vue.js 3 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Mail Server**: Postfix/Dovecot
- **Web Server**: Nginx (Reverse Proxy)
- **Domain**: csmcl.space

### Server Infrastructure
- **Operating System**: Ubuntu 22.04 LTS
- **IP Address**: 147.93.58.192
- **SSL**: Let's Encrypt certificates

## Component Setup

### 1. MongoDB Configuration

#### Database Users
1. **Admin User**
   ```javascript
   user: "admin"
   roles: ["root"]
   ```

2. **Application User**
   ```javascript
   user: "cosmicnexus"
   roles: [
     { role: "userAdminAnyDatabase", db: "admin" },
     { role: "readWriteAnyDatabase", db: "admin" }
   ]
   ```

#### MongoDB Configuration File (`/etc/mongod.conf`)
```yaml
storage:
  dbPath: /var/lib/mongodb

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 0.0.0.0

security:
  authorization: enabled

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
```

### 2. Mail Server Setup

#### Mail User Configuration
- **Username**: noreply@cosmical.me
- **Purpose**: Sending verification emails and system notifications
- **Configuration**: No shell access, mail sending only

### 3. Application Directory Structure

```
/var/www/cosmic-nexus/
├── frontend/           # Static Vue.js files
│   ├── index.html
│   └── assets/
├── backend/           # Node.js application
│   ├── dist/         # Compiled JavaScript
│   ├── src/          # Source code
│   ├── .env          # Environment configuration
│   └── node_modules/ # Dependencies
```

### 4. Nginx Configuration

Location: `/etc/nginx/sites-available/cosmic-nexus`

```nginx
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
    
    # SSL Configuration
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend
    location / {
        root /var/www/cosmic-nexus/frontend;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Backend Service Configuration

Location: `/etc/systemd/system/cosmic-nexus.service`

```ini
[Unit]
Description=Cosmic Nexus Backend Service
After=network.target mongod.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/cosmic-nexus/backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 6. Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb://cosmicnexus:CosmicNexus2025!@localhost:27017/cosmic-nexus?authSource=admin

# JWT Configuration
JWT_SECRET=csmcl_jwt_secret_key_2025
JWT_EXPIRES_IN=7d

# Mail Server Configuration
MAIL_HOST=mail.cosmical.me
MAIL_PORT=587
MAIL_USER=noreply@cosmical.me
MAIL_FROM=Cosmic Nexus <noreply@cosmical.me>

# Frontend URL (for CORS)
FRONTEND_URL=https://csmcl.space
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://csmcl.space/api
```

## Deployment Process

### 1. Building the Application

```bash
# Frontend
npm run build

# Backend
cd server && npm install && npm run build
```

### 2. Deploying Updates

```bash
# Deploy frontend
rsync -avz --delete dist/ root@147.93.58.192:/var/www/cosmic-nexus/frontend/

# Deploy backend
rsync -avz --exclude 'node_modules' --exclude '.env' server/ root@147.93.58.192:/var/www/cosmic-nexus/backend/
```

### 3. Post-Deployment Steps

```bash
ssh root@147.93.58.192

# Install backend dependencies
cd /var/www/cosmic-nexus/backend && npm install

# Update permissions
chown -R www-data:www-data /var/www/cosmic-nexus

# Restart services
systemctl restart cosmic-nexus
systemctl reload nginx
```

## Maintenance

### Service Management
```bash
# Backend service
systemctl status cosmic-nexus
systemctl start cosmic-nexus
systemctl stop cosmic-nexus
systemctl restart cosmic-nexus

# MongoDB
systemctl status mongod
systemctl restart mongod

# Nginx
systemctl status nginx
systemctl reload nginx
```

### Log Locations
- Backend: `journalctl -u cosmic-nexus`
- MongoDB: `/var/log/mongodb/mongod.log`
- Nginx: `/var/log/nginx/{access,error}.log`
- Mail: `/var/log/mail.log`

### Backup Procedures
1. MongoDB Backup
```bash
mongodump --uri="mongodb://cosmicnexus:CosmicNexus2025!@localhost:27017/cosmic-nexus?authSource=admin" --out=/backup/mongodb/$(date +%Y%m%d)
```

2. Application Backup
```bash
tar -czf /backup/cosmic-nexus-$(date +%Y%m%d).tar.gz /var/www/cosmic-nexus
```

## Security Considerations

1. **File Permissions**
   - All sensitive files are owned by www-data
   - Environment files have 600 permissions
   - SSL certificates are properly secured

2. **Network Security**
   - MongoDB only accepts authenticated connections
   - All HTTP traffic is redirected to HTTPS
   - Modern SSL configuration is used
   - Rate limiting is implemented on authentication endpoints

3. **Authentication**
   - JWT tokens for session management
   - Bcrypt for password hashing
   - Email verification required
   - Secure password reset flow

## Troubleshooting

### Common Issues and Solutions

1. **Backend Service Won't Start**
   ```bash
   journalctl -u cosmic-nexus -n 50
   ```

2. **MongoDB Connection Issues**
   ```bash
   mongosh --eval "db.runCommand({connectionStatus: 1})"
   ```

3. **Nginx Configuration Test**
   ```bash
   nginx -t
   ```

4. **SSL Certificate Issues**
   ```bash
   certbot certificates
   ```

### Health Checks

1. **Backend API**
   ```bash
   curl -I https://csmcl.space/api/health
   ```

2. **MongoDB**
   ```bash
   mongosh admin --eval "db.serverStatus()"
   ```

3. **Mail Server**
   ```bash
   telnet mail.cosmical.me 587
   ```
