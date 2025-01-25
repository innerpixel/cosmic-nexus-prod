# Environment Configuration Guide

This document describes the environment configuration and credentials required for running the Cosmic Nexus application in different environments.

## Environment Files

The application uses different environment files for different deployment contexts:

- `.env.development` - Local development environment
- `.env.test` - Testing environment
- `.env.production` - Production environment

These files are not committed to the repository for security reasons. Instead, use the `.env.example` file as a template to create these files.

## Domain Configuration

### Development Environment
- **Local Domain**: cosmic-nexus.local
- **Protocol**: HTTPS (self-signed certificate)
- **Web Root**: /var/www/cosmic-nexus
- **Nginx Config**: /etc/nginx/conf.d/cosmic-nexus.conf

### Production Environment
- **Domain**: csmcl.space
- **Protocol**: HTTPS (valid SSL certificate)
- **Mail Domain**: cosmical.me (separate mail server)

## Credential Configuration

### Mail Server (cosmical.me)

The application uses cosmical.me as the mail server for all environments.

#### Development Environment
- **Host**: mail.cosmical.me
- **Port**: 587 (SMTP with STARTTLS)
- **User**: noreply@cosmical.me
- **From**: Cosmic Nexus Dev <noreply@cosmical.me>
- **Password**: Obtain from system administrator

#### Testing Environment
- Uses local Postfix mail server with SSL
- Mail server configured for local development
- Test emails are handled locally
- SSL certificates for secure mail testing

#### Production Environment
- **Host**: mail.cosmical.me
- **Port**: 587 (SMTP with STARTTLS)
- **User**: noreply@cosmical.me
- **From**: Cosmic Nexus <noreply@cosmical.me>
- **Password**: Obtain from system administrator (different from development)

### Database Configuration

#### Development
- **URI**: mongodb://localhost:27017/cosmic-nexus-dev
- **Authentication**: Disabled for local development
- **Backup**: Local snapshots

#### Production
- **URI**: mongodb://csmcl.space:27017/cosmic-nexus-prod
- **Authentication**: Required
- **Backup**: Automated daily backups

### SSL Certificates

#### Development
- Self-signed certificates
- Location: /etc/nginx/ssl/nginx-selfsigned.{crt,key}
- Valid for local development only
- Browser security warnings expected

#### Production
- Valid SSL certificates
- Automated renewal through Let's Encrypt
- HSTS enabled
- No browser warnings

### Environment Variables

#### Development (.env.development)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cosmic-nexus-dev
JWT_SECRET=development_secret
JWT_EXPIRES_IN=7d
MAIL_HOST=mail.cosmical.me
MAIL_PORT=587
MAIL_USER=noreply@cosmical.me
MAIL_FROM="Cosmic Nexus Dev <noreply@cosmical.me>"
FRONTEND_URL=https://cosmic-nexus.local
API_URL=https://cosmic-nexus.local/api
MAIL_DOMAIN=cosmical.me
```

#### Production (.env.production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://csmcl.space:27017/cosmic-nexus-prod
JWT_SECRET=<secure-production-secret>
JWT_EXPIRES_IN=7d
MAIL_HOST=mail.cosmical.me
MAIL_PORT=587
MAIL_USER=noreply@cosmical.me
MAIL_FROM="Cosmic Nexus <noreply@cosmical.me>"
FRONTEND_URL=https://csmcl.space
API_URL=https://csmcl.space/api
MAIL_DOMAIN=cosmical.me
```

## Security Considerations

### Development
- Self-signed SSL certificates are used
- SELinux is in permissive mode
- Development credentials have limited permissions
- Local environment is isolated from production

### Production
- Valid SSL certificates from trusted CA
- SELinux in enforcing mode
- DKIM, SPF, and DMARC configured for mail server
- Regular security audits and updates
- Restricted access to production credentials
