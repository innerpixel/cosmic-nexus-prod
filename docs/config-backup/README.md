# CSMCL Project Configuration Backup

## Local Development Setup

### System Requirements
- OS: AlmaLinux
- Node.js
- MongoDB
- Nginx

### Directory Structure
```
/var/www/local-dev.test          # Web root directory
/home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas  # Project root
```

### Services Configuration

#### MongoDB
```properties
Database Name: csmcl
Admin User: csmclAdmin
Admin Password: CsmclAdmin2025!
Connection URI: mongodb://csmclAdmin:CsmclAdmin2025!@localhost:27017/csmcl?authSource=admin
```

#### Backend Service (systemd)
File: `/etc/systemd/system/csmcl-backend.service`
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

#### Mail Configuration
```properties
Mail Server: mail.cosmical.me
Mail Port: 25
From Address: noreply@cosmical.me
Development Mode: Uses ethereal.email for testing
```

### Domain Configuration
- Local development domain: local-dev.test
- Production domain: csmcl.space
- Mail server domain: cosmical.me (mail server only)
- SSL: Enabled with Let's Encrypt for both domains
- DKIM: Configured via OpenDKIM
- SPF: Configured
- DMARC: Configured

### Current Server Configuration (Updated 2025-01-23)

#### Mail Server (cosmical.me)
```properties
Host: mail.cosmical.me
TLS: Enabled with Let's Encrypt
DKIM: Active via localhost:8891
Allowed Networks: 127.0.0.0/8, [::1]/128, 147.93.58.192/32
Web Access: Blocked (returns 444)
```

#### Web Server (csmcl.space)
```properties
Domain: csmcl.space, www.csmcl.space
SSL: Enabled with Let's Encrypt
Frontend: /var/www/csmcl.space/frontend/dist
Backend API: localhost:5000
Security Headers: Enabled
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer-when-downgrade
```

### System Users
- root: System administrator
- ubuntu: Default system user
- test: Test user account

### Git Repository Setup
```bash
# Remote repositories
local    /var/git/local.csmcl-space.git
production    git@github.com:innerpixel/cosmic-nexus-prod.git
```

## Production Setup (VPS)

### System Information
- OS: Ubuntu 22.04
- Domain: csmcl.space
- Mail Server: mail.cosmical.me

### Security Configurations
- SSL: Enabled and configured for csmcl.space
- DKIM: Configured
- SPF: Configured
- DMARC: Configured

### Important Notes
1. The mail server (cosmical.me) should not serve any web content
2. csmcl.space domain does not serve mail
3. All development should be tested locally before deploying to production

## Deployment Process

1. Test changes locally on local-dev.test
2. Commit changes to git
3. Push to local repository for local testing
4. Push to production repository for deployment

## Maintenance

### Local Development
```bash
# Start services
sudo systemctl start mongod
sudo systemctl start nginx
sudo systemctl start csmcl-backend

# Check service status
sudo systemctl status mongod
sudo systemctl status nginx
sudo systemctl status csmcl-backend

# View logs
sudo journalctl -u csmcl-backend -f
sudo tail -f /var/log/nginx/error.log
```

### Backup MongoDB
```bash
# Local backup
mongodump --uri="mongodb://csmclAdmin:CsmclAdmin2025!@localhost:27017/csmcl?authSource=admin" --out=/path/to/backup/directory
```

## Recovery Steps

### Local Environment
1. Install required services (MongoDB, Nginx, Node.js)
2. Copy configuration files to appropriate locations
3. Create MongoDB user and database
4. Start services
5. Clone repository
6. Install dependencies
7. Start application

### Production Environment
1. Configure DNS for csmcl.space
2. Set up SSL certificates
3. Configure mail server on cosmical.me
4. Set up DKIM, SPF, and DMARC
5. Deploy application
