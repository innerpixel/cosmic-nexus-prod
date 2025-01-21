# Development Guide

## Environment Setup

### Local Development Environment
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Database**: `mongodb://localhost:27017/cosmic-nexus-dev`
- **Mail Server**: `mail.dev.cosmical.me` (remote mail server)

### VPS Production Environment
- **Frontend**: `https://csmcl.space`
- **Backend API**: `https://csmcl.space/api`
- **Database**: `mongodb://csmcl.space:27017/cosmic-nexus-prod`
- **Mail Server**: `mail.cosmical.me`

## Development vs Production

### Local Development
When developing locally, you should:
1. Use local MongoDB instance (`cosmic-nexus-dev` database)
2. Run local API server on port 5000
3. Run local frontend server on port 3000
4. Connect to remote mail server for email functionality

Benefits:
- Safe environment for testing
- No risk of affecting production data
- Faster development cycle
- Works offline (except for email features)

### Production Environment
Production environment uses:
1. VPS MongoDB instance (`cosmic-nexus-prod` database)
2. VPS API server
3. Production frontend
4. Same mail server as development

Never connect to production database during development to prevent accidental data modifications.

## Production Service Usage Risks

### Risks of Using Production Services in Development

1. **Data Integrity Risks**
   - Accidental modification of production data
   - Mixing test and production data
   - Database corruption risks
   - Unintended side effects on real user data

2. **Security Vulnerabilities**
   - Exposure of production credentials
   - Increased attack surface
   - Risk of credential leakage in development
   - Accidental commits of sensitive data

3. **Email System Risks**
   - Creation of test accounts in production
   - Accidental emails to real users
   - Impact on email quotas and deliverability
   - Mail server reputation risks

4. **Performance Impact**
   - Slower development cycle
   - Production service degradation
   - Network-related issues
   - Resource contention

5. **Development Limitations**
   - Dependency on internet connection
   - Limited testing capabilities
   - Difficulty in debugging
   - Constrained experimentation

### Recommended Approach

1. **Local Development**
   - Use local MongoDB instance
   - Run local API server
   - Local file storage
   - Local user management

2. **Production Integration**
   - Only use production mail server (necessary evil)
   - Keep separate development subdomain
   - Strict access controls
   - Regular security audits

3. **Testing Strategy**
   - Create comprehensive test environment
   - Use mocks when possible
   - Implement proper cleanup procedures
   - Regular backup verification

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
MAIL_HOST=mail.dev.cosmical.me
MAIL_PORT=587
MAIL_USER=noreply@dev.cosmical.me
MAIL_FROM=Cosmic Nexus Dev <noreply@dev.cosmical.me>
FRONTEND_URL=http://localhost:3000
MAIL_DOMAIN=dev.cosmical.me
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
1. MongoDB Connection
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Start MongoDB if not running
   sudo systemctl start mongod
   ```

2. Email Server
   ```bash
   # Test mail server connection
   telnet mail.cosmical.me 587
   ```

3. API Connection
   - Check if backend is running on port 5000
   - Verify proxy settings in `vite.config.js`
   - Check CORS configuration in backend

### Logs
- Frontend logs: Browser console
- Backend logs: Terminal running backend server
- MongoDB logs: `/var/log/mongodb/mongod.log`
- Email logs: Available in backend console with debug mode enabled
