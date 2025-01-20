# Authentication Flow Documentation

This document details the authentication system implemented in the Cosmic Nexus application.

## Overview

The application implements a JWT-based authentication system with email verification, running behind a secure Nginx reverse proxy with forced HTTPS.

## Authentication Infrastructure

### JWT Configuration
- **Token Type**: JSON Web Tokens (JWT)
- **Expiration**: 7 days
- **Configuration Location**: Backend `.env` file
- **Environment Variables**:
  ```env
  JWT_SECRET=csmcl_jwt_secret_key_2025
  JWT_EXPIRES_IN=7d
  ```

## Security Layers

### SSL/TLS Configuration
- Forced HTTPS redirect
- Modern SSL protocols:
  - TLSv1.2
  - TLSv1.3
- Secure cipher configuration

### Security Headers
```nginx
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer-when-downgrade
```

## Email Verification System

### Mail Server Configuration
- **Server**: Mail services on cosmical.me
- **System Email**: noreply@cosmical.me
- **Port**: 587 (TLS)
- **Environment Variables**:
  ```env
  MAIL_HOST=mail.cosmical.me
  MAIL_PORT=587
  MAIL_USER=noreply@cosmical.me
  MAIL_FROM=Cosmic Nexus <noreply@cosmical.me>
  ```

## API Security

### Endpoint Configuration
- All API routes are prefixed with `/api`
- Nginx reverse proxy configuration:
  ```nginx
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
  ```

### CORS Configuration
- Restricted to domain: `https://csmcl.space`
- Configured via environment variable:
  ```env
  FRONTEND_URL=https://csmcl.space
  ```

## Database Security

### MongoDB Configuration
- Authentication enabled by default
- Role-based access control (RBAC)
- Dedicated application user: `cosmicnexus`
- User permissions:
  ```javascript
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
  ```

## Authentication Flow

1. **User Registration**
   - User submits registration credentials
   - System creates account (inactive)
   - Verification email sent via cosmical.me

2. **Email Verification**
   - User clicks verification link
   - Account activated upon successful verification

3. **Login Process**
   - User submits credentials
   - Backend validates credentials
   - JWT issued upon successful validation
   - Token returned to client

4. **Request Authentication**
   - Client stores JWT
   - Token included in Authorization header
   - Backend validates token for protected routes

5. **Token Management**
   - Tokens expire after 7 days
   - Invalid tokens result in 401 response
   - Client must re-authenticate on token expiration

## Environment Configuration

### Production Settings
```env
NODE_ENV=production
FRONTEND_URL=https://csmcl.space
MONGODB_URI=mongodb://cosmicnexus:CosmicNexus2025!@localhost:27017/cosmic-nexus?authSource=admin
```

### Frontend Configuration
```env
VITE_API_URL=https://csmcl.space/api
```

## Security Best Practices

1. All sensitive data stored in environment variables
2. Forced HTTPS for all connections
3. Secure headers implemented
4. Modern SSL/TLS protocols only
5. Database authentication required
6. Email verification mandatory
7. Token-based session management
8. CORS restrictions in place
