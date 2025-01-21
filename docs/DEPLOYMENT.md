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
/var/www/csmcl.space/
├── frontend/           # Frontend application
│   ├── dist/          # Built frontend files
│   └── src/           # Source files
├── backend/           # Backend application
│   ├── src/           # Source files
│   └── config/        # Configuration files
└── deployment/        # Deployment scripts
```

### 4. Nginx Configuration

#### Local Development Setup
Location: `/etc/nginx/conf.d/local-dev.test.conf`
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name local-dev.test;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name local-dev.test;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/local-dev.test.crt;
    ssl_certificate_key /etc/nginx/ssl/local-dev.test.key;

    # Root directory
    root /var/www/csmcl.space/frontend/dist;

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Production Setup
Location: `/etc/nginx/sites-available/csmcl.space`
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
        root /var/www/csmcl.space/frontend/dist;
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

Location: `/etc/systemd/system/csmcl-space.service`

```ini
[Unit]
Description=CSMCL Space Backend Service
After=network.target mongod.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/csmcl.space/backend
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

## Production Deployment

### Initial VPS Setup

1. **Verify Deployment Directory**:
   ```bash
   cd /var/www/csmcl.space
   ```

2. **Setup Systemd Service**:
   Create `/etc/systemd/system/csmcl-space.service`:
   ```ini
   [Unit]
   Description=CSMCL Space Backend
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/csmcl.space/backend
   ExecStart=/usr/bin/node src/index.js
   Restart=always
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and Start Service**:
   ```bash
   sudo systemctl enable csmcl-space
   sudo systemctl start csmcl-space
   ```

4. **Initialize Git Repository**:
   ```bash
   cd /var/www/csmcl.space
   git init
   git remote add origin git@github.com:innerpixel/cosmic-nexus-prod.git
   git fetch origin
   git checkout main
   ```

### GitHub Actions Setup

1. **Add Repository Secrets**:
   - Go to Settings > Secrets and Variables > Actions
   - Add the following secrets:
     - `SSH_USERNAME`: VPS SSH username
     - `SSH_PRIVATE_KEY`: SSH private key for VPS access

2. **Workflow File**:
   `.github/workflows/deploy-prod.yml` handles automated deployment:
   ```yaml
   name: Deploy to Production
   
   on:
     push:
       branches:
         - main
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Deploy to VPS
           uses: appleboy/ssh-action@master
           with:
             host: csmcl.space
             username: ${{ secrets.SSH_USERNAME }}
             key: ${{ secrets.SSH_PRIVATE_KEY }}
             script: |
               cd /var/www/csmcl.space
               git pull origin main
               cd frontend
               npm install
               npm run build
               cd ../backend
               npm install
               sudo systemctl restart csmcl-space
   ```

### Service Management

1. **Monitor Service**:
   ```bash
   sudo systemctl status csmcl-space
   sudo journalctl -u csmcl-space -f
   ```

2. **Service Controls**:
   ```bash
   sudo systemctl start csmcl-space    # Start service
   sudo systemctl stop csmcl-space     # Stop service
   sudo systemctl restart csmcl-space  # Restart service
   sudo systemctl reload csmcl-space   # Reload configuration
   ```

### SSL Configuration

1. **Install Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain SSL Certificate**:
   ```bash
   sudo certbot --nginx -d csmcl.space
   ```

3. **Auto-renewal**:
   ```bash
   sudo systemctl status certbot.timer
   ```

### Deployment Flow

1. Push changes to GitHub:
   ```bash
   git push production main
   ```

2. GitHub Actions automatically:
   - Connects to VPS via SSH
   - Pulls latest changes
   - Installs dependencies
   - Builds frontend
   - Restarts systemd service

3. Monitor deployment:
   - Check GitHub Actions status
   - Monitor systemd service logs
   - Verify site functionality

### Rollback Process

If needed, roll back to previous version:
```bash
cd /var/www/csmcl.space
git log --oneline  # Find commit to roll back to
git reset --hard <commit-hash>
cd frontend && npm install && npm run build
cd ../backend && npm install
sudo systemctl restart csmcl-space
```

## Maintenance

### Service Management
```bash
# Backend service
sudo systemctl status csmcl-space
sudo systemctl start csmcl-space
sudo systemctl stop csmcl-space
sudo systemctl restart csmcl-space

# MongoDB
sudo systemctl status mongod
sudo systemctl restart mongod

# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx
```

### Log Locations
- Backend: `sudo journalctl -u csmcl-space`
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
tar -czf /backup/csmcl-space-$(date +%Y%m%d).tar.gz /var/www/csmcl.space
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
   sudo journalctl -u csmcl-space -n 50
   ```

2. **MongoDB Connection Issues**
   ```bash
   mongosh --eval "db.runCommand({connectionStatus: 1})"
   ```

3. **Nginx Configuration Test**
   ```bash
   sudo nginx -t
   ```

4. **SSL Certificate Issues**
   ```bash
   sudo certbot certificates
   ```

5. **Permission Issues**
   ```bash
   # Fix web directory permissions
   sudo chown -R $USER:$USER /var/www/csmcl.space

   # Fix storage directory permissions
   sudo chown -R $USER:$USER storage/
   chmod -R 755 storage/

   # Fix log file permissions
   sudo chown $USER:$USER /var/log/csmcl-space.log
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

## Environment Overview

### Local Development
- **Domain**: `local-dev.test`
- **SSL**: Local certificates via mkcert
- **Mail Server**: Local postfix for development
- **Database**: Local MongoDB instance
- **Web Server**: Nginx with reverse proxy

### Production
- **Web Domain**: `csmcl.space`
- **Mail Domain**: `cosmical.me`
- **Server**: Ubuntu 22.04 LTS
- **Database**: MongoDB 5+
- **Node.js**: v20.17.0+

## Directory Structure
```
/var/www/csmcl.space/
├── frontend/           # Frontend application
│   ├── dist/          # Built frontend files
│   └── src/           # Source files
├── backend/           # Backend application
│   ├── src/           # Source files
│   └── config/        # Configuration files
└── deployment/        # Deployment scripts
```

## Git Workflow

### Repository Setup
```bash
# Production repository (GitHub)
git remote add production git@github.com:innerpixel/cosmic-nexus-prod.git

# Local deployment repository
git remote add local /var/git/local.csmcl-space.git
```

### Deployment Flow
1. **Local Development**:
   ```bash
   # Deploy to local environment
   git push local <branch-name>
   ```

2. **Production**:
   ```bash
   # Push stable changes to production
   git push production main
   ```

### Branches
- `main`: Production-ready code
- `stable-auth`: Stable authentication system
- `feature/*`: Feature branches

### Branch Strategy
1. Create feature branches from `main`
2. Test locally using `git push local feature/branch`
3. After testing, merge to `main`
4. Deploy to production with `git push production main`

### Deployment Hooks
The post-receive hook in `/var/git/local.csmcl-space.git/hooks/post-receive` handles:
1. Checkout of pushed code to `/var/www/csmcl.space/frontend`
2. Installation of frontend dependencies
3. Building of frontend
4. Copying and setting up backend
5. Installation of backend dependencies

## Local Development Setup

### 1. Prerequisites
```bash
# Install required packages
sudo dnf install nginx mongodb-org postfix

# Create directory structure
sudo mkdir -p /var/www/csmcl.space/{frontend,backend}
sudo chown -R $USER:$USER /var/www/csmcl.space

# Start required services
sudo systemctl enable --now nginx mongodb postfix

# Install mkcert and create certificates
mkcert -install
mkcert local-dev.test
```

### 2. Nginx Configuration
Location: `/etc/nginx/conf.d/local-dev.test.conf`
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name local-dev.test;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name local-dev.test;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/local-dev.test.crt;
    ssl_certificate_key /etc/nginx/ssl/local-dev.test.key;

    # Root directory
    root /var/www/csmcl.space/frontend/dist;

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Environment Configuration
Create `.env.development`:
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cosmic-nexus
API_BASE_URL=http://local-dev.test:5000/api
FRONTEND_URL=http://local-dev.test:3000
MAIL_API_ENDPOINT=http://local-dev.test:25/api
MAIL_DOMAIN=local-dev.test
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_SECURE=false
```

### 4. Deployment Process
The deployment process is handled by `deploy-app.sh`:
```bash
./deployment/deploy-app.sh
```

This script:
1. Builds the frontend
2. Copies built files to nginx directory
3. Installs backend dependencies
4. Starts the Node.js server

### 5. Monitoring
- **Frontend**: Served at `https://local-dev.test`
- **Backend**: Runs on port 5000
- **Logs**: `/var/log/csmcl-space.log`
- **Mail**: Check `/var/log/maillog` for email delivery

## Troubleshooting

### Common Issues

1. **Permission Issues**
```bash
# Fix web directory permissions
sudo chown -R $USER:$USER /var/www/csmcl.space

# Fix storage directory permissions
sudo chown -R $USER:$USER storage/
chmod -R 755 storage/

# Fix log file permissions
sudo chown $USER:$USER /var/log/csmcl-space.log
```

2. **Server Already Running**
```bash
# Kill existing Node.js process
pkill -f "node.*src/index.js"
```

3. **MongoDB Connection Issues**
```bash
# Check MongoDB status
sudo systemctl status mongodb

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Useful Commands

```bash
# View application logs
tail -f /var/log/csmcl-space.log

# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check mail logs
tail -f /var/log/maillog
```

## Security Considerations

1. **SSL Certificates**
   - Local development uses mkcert
   - Production uses Let's Encrypt

2. **Environment Variables**
   - Never commit `.env` files
   - Use different configs for dev/prod

3. **Access Control**
   - Proper file permissions
   - Secure nginx configuration
   - MongoDB authentication

## Backup and Recovery

### Database Backup
```bash
# Backup MongoDB
mongodump --db cosmic-nexus --out /backup/$(date +%Y%m%d)

# Restore MongoDB
mongorestore --db cosmic-nexus /backup/YYYYMMDD/cosmic-nexus
```

### Application Backup
```bash
# Backup application files
tar -czf /backup/app_$(date +%Y%m%d).tar.gz /var/www/csmcl.space
```

## Performance Monitoring

1. **Application Metrics**
   - Server response times
   - Database query performance
   - Memory usage

2. **System Monitoring**
   - CPU usage
   - Memory consumption
   - Disk space

3. **Error Tracking**
   - Application logs
   - Nginx error logs
   - MongoDB logs
