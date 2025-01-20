# Cosmic Nexus - Authentication System Documentation

## Overview
This document describes the authentication and user management system implemented for Cosmic Nexus. The system provides secure user authentication, email verification, and profile management using modern web technologies.

## Technology Stack

### Frontend
- **Vue.js 3**: Progressive JavaScript framework for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Vite**: Next-generation frontend build tool
- **Pinia**: State management solution for Vue.js
- **Vue Router**: Official router for Vue.js
- **Vee-validate**: Form validation library
- **Yup**: Schema validation library

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **MongoDB**: NoSQL database for user data storage
- **JWT**: JSON Web Tokens for secure authentication
- **Nodemailer**: Module for email sending
- **Bcrypt**: Password hashing library

### Server Infrastructure
- **Ubuntu 22.04 LTS**: Server operating system
- **Nginx**: Web server and reverse proxy
- **MongoDB**: Database server
- **Postfix/Dovecot**: Mail server setup
- **Let's Encrypt**: SSL certificate provider

## Features

### Authentication
1. **User Registration**
   - Email-based registration
   - Password strength validation
   - Display name validation (1-2 words)
   - Automatic email verification process

2. **Login System**
   - JWT-based authentication
   - Secure password handling
   - Remember me functionality
   - Password reset capability

3. **Email Verification**
   - Automated verification email sending
   - Secure token generation
   - Token expiration handling
   - Resend verification option

4. **Security Features**
   - Password hashing with bcrypt
   - JWT token management
   - Rate limiting for API endpoints
   - CORS protection
   - SSL/TLS encryption

### User Management
1. **User Profile**
   - Display name management
   - Email management
   - Profile customization
   - Theme preferences (Light/Dark/System)

2. **Session Management**
   - Automatic token refresh
   - Secure logout
   - Multiple device handling

## API Endpoints

### Authentication Routes
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/verify-email/:token
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
```

### Protected Routes
```
GET /api/profile
PUT /api/profile/update
```

## Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=https://cosmical.me/api
```

### Backend (.env)
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://[username]:[password]@[host]:[port]/cosmic-nexus
JWT_SECRET=[secret_key]
JWT_EXPIRES_IN=7d
MAIL_HOST=mail.cosmical.me
MAIL_PORT=587
MAIL_USER=noreply@cosmical.me
MAIL_FROM=Cosmic Nexus <noreply@cosmical.me>
FRONTEND_URL=https://cosmical.me
```

## Deployment

### Prerequisites
1. Ubuntu 22.04 LTS server
2. Node.js and npm installed
3. MongoDB installed and configured
4. Nginx installed
5. SSL certificates from Let's Encrypt
6. Mail server configured (Postfix/Dovecot)

### Deployment Process
1. Build frontend: `npm run build`
2. Build backend: `cd server && npm run build`
3. Deploy using the deployment script: `./deploy.sh`

### Server Configuration
- Nginx serves static frontend files
- Nginx proxies API requests to Node.js backend
- MongoDB runs with authentication enabled
- All traffic is SSL encrypted
- Email server handles verification emails

## Security Considerations
1. All passwords are hashed using bcrypt
2. JWT tokens are used for session management
3. Email verification is required
4. Rate limiting prevents brute force attacks
5. CORS is configured for security
6. SSL/TLS encryption for all traffic
7. Secure headers are set in Nginx

## Monitoring and Maintenance
1. Log files location:
   - Application logs: `/var/log/cosmic-nexus/`
   - Nginx logs: `/var/log/nginx/`
   - MongoDB logs: `/var/log/mongodb/`
   - Mail logs: `/var/log/mail.log`

2. Service management:
   ```bash
   systemctl status cosmic-nexus    # Check backend service
   systemctl status nginx          # Check web server
   systemctl status mongod        # Check database
   systemctl status postfix      # Check mail server
   ```

## Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

## License
MIT License
