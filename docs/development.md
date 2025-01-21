# Development Guide

## Environment Setup

### Local Development Environment
- **Frontend**: `https://cosmic-nexus.local`
- **Backend API**: `https://cosmic-nexus.local/api`
- **Database**: `mongodb://localhost:27017/cosmic-nexus-dev`
- **Mail Server**: `mail.cosmical.me` (remote mail server)

### VPS Production Environment
- **Frontend**: `https://csmcl.space`
- **Backend API**: `https://csmcl.space/api`
- **Database**: `mongodb://csmcl.space:27017/cosmic-nexus-prod`
- **Mail Server**: `mail.cosmical.me`

## Development vs Production

### Local Development
When developing locally, you should:
1. Use local MongoDB instance (`cosmic-nexus-dev` database)
2. Access the site via `https://cosmic-nexus.local`
3. API endpoints available at `https://cosmic-nexus.local/api`
4. Connect to remote mail server for email functionality

Benefits:
- Safe environment for testing
- No risk of affecting production data
- Faster development cycle
- Works offline (except for email features)
- HTTPS enabled with self-signed certificates
- Similar configuration to production

### Production Environment
Production environment uses:
1. VPS MongoDB instance (`cosmic-nexus-prod` database)
2. VPS API server
3. Production frontend
4. Dedicated mail server (cosmical.me)

Never connect to production database during development to prevent accidental data modifications.

## Local Development Setup

### Prerequisites
- AlmaLinux (local development OS)
- Node.js and npm
- MongoDB
- Nginx 1.26.2
- Git

### Local Domain Setup
1. Add to `/etc/hosts`:
   ```
   127.0.0.1   cosmic-nexus.local
   ```

### Nginx Configuration
- Configuration file: `/etc/nginx/conf.d/cosmic-nexus.conf`
- SSL certificates: `/etc/nginx/ssl/nginx-selfsigned.{crt,key}`
- Web root: `/var/www/cosmic-nexus`
- Logs: `/var/log/nginx/cosmic-nexus-{access,error}.log`

### Security Notes
- Local development uses self-signed SSL certificates
- SELinux is set to permissive mode for development
- HTTPS is enforced (HTTP redirects to HTTPS)
- API endpoints are properly proxied

## Production Service Usage Risks

### Risks of Using Production Services in Development

1. **Data Integrity Risks**
   - Accidental modification of production data
   - Mixing test and production data
   - Database corruption risks
   - Unintended side effects on real user data

2. **Security Vulnerabilities**
   - Exposing production credentials
   - Security token leaks
   - Unauthorized access risks

## Security Differences

### Development
1. Self-signed SSL certificates
2. SELinux in permissive mode
3. Local domain (cosmic-nexus.local)
4. Development database

### Production
1. Valid SSL certificates
2. SELinux in enforcing mode
3. Production domain (csmcl.space)
4. Production database
5. DKIM, SPF, and DMARC configured

## Domain Services
- **Web Server**: `csmcl.space`
  - Serves web content and API
  - Hosts MongoDB database
  - SSL configured with HTTPS
  - DKIM, SPF, and DMARC configured for email authentication

- **Mail Server**: `cosmical.me`
  - Dedicated mail server only
  - Does not serve web content
  - Handles all email communications
  - SMTP configuration on port 587

## Environment Files

### Development (.env.development)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cosmic-nexus-dev
JWT_SECRET=development_secret
JWT_EXPIRES_IN=7d
MAIL_HOST=mail.cosmical.me
MAIL_PORT=587
MAIL_USER=noreply@cosmical.me
MAIL_FROM=Cosmic Nexus Dev <noreply@cosmical.me>
FRONTEND_URL=https://cosmic-nexus.local
MAIL_DOMAIN=cosmical.me
```

### Production (.env.production)
```env
PORT=5000
MONGODB_URI=${MONGO_URI}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
MAIL_HOST=mail.cosmical.me
MAIL_PORT=587
MAIL_USER=noreply@cosmical.me
MAIL_FROM=Cosmic Nexus <noreply@cosmical.me>
FRONTEND_URL=${FRONTEND_URL}
MAIL_DOMAIN=cosmical.me
```

## Development Workflow

### Starting Development Environment
1. Run the development script:
   ```bash
   ./development.sh
   ```
   This will:
   - Start local MongoDB
   - Start backend server on port 5000
   - Start frontend Vite server on port 3000

### API Proxy Configuration
The frontend Vite server is configured to proxy API requests:
- All requests to `/api/*` are forwarded to `http://localhost:5000`
- WebSocket connections are supported
- Detailed proxy logs are enabled for debugging

### Database Management
- Development database: `cosmic-nexus-dev`
- Production database: `cosmic-nexus-prod`
- Each environment has its own database to prevent mixing data
- MongoDB authentication is required in both environments

### Email Configuration
Both environments use the same mail server (`mail.cosmical.me`) but with different configurations:
- Development: Emails are sent with development-specific templates
- Production: Emails use production templates with proper branding

### Security Notes
1. JWT secrets are environment-specific
2. Development uses simpler secrets for easier debugging
3. Production uses strong, unique secrets
4. SSL/TLS is enabled in production only
5. CORS is configured to allow only specific origins

## Troubleshooting

### Common Issues
1. Certificate warnings in browser
   - Expected for self-signed certificates
   - Safe to proceed in development environment
2. Permission issues
   - Check Nginx logs
   - Verify file permissions
   - SELinux contexts if enabled
3. API connection issues
   - Verify Nginx proxy configuration
   - Check backend service status
   - Review API logs
