# CSMCL SPACE - System Architecture

## System Overview

CSMCL SPACE is a decentralized platform that combines traditional web services with blockchain technology, providing users with a unique digital identity and space for collaboration.

### Domain Structure

#### 1. Mail Server (`cosmical.me`)
- **Purpose**: Dedicated mail services only
- **Email Authentication**:
  - DKIM: Digital signatures for email verification
  - SPF: Authorized mail server specification
  - DMARC: Email authentication policy enforcement
- **Features**:
  - User email accounts (`username@cosmical.me`)
  - No web content hosting
  - Strict email security policies
  - Complete email authentication suite

#### 2. Web Server (`csmcl.space`)
- **Purpose**: Web application and user space hosting
- **Security**:
  - SSL/TLS encryption
  - Secure user sessions
  - API authentication
- **Features**:
  - Web application hosting
  - User home directories
  - Public space data storage
  - No mail services or email handling

### Application Architecture

#### 1. Frontend (Vue.js + Tailwind CSS + Vite)
- **Technology Stack**:
  - Vue.js 3 with Composition API
  - Tailwind CSS for styling
  - Vite for development and building
- **Key Components**:
  - Registration interface
  - User dashboard
  - Profile management
  - Public space interface

#### 2. Backend (Node.js + Express)
- **Core Services**:
  - User authentication
  - Email verification
  - SIM verification
  - Account management
- **Integration Points**:
  - Mail server account creation
  - Web server space allocation
  - Blockchain interaction (planned)

### Email System Architecture

#### 1. Domain Separation and Responsibilities

##### Mail Server (`cosmical.me`)
- **Primary Role**: Email service delivery and SMTP handling
- **Server Configuration**:
  - Host: `mail.cosmical.me`
  - Port: 587 (STARTTLS)
  - Protocol: SMTP
- **Security Features**:
  - DKIM signatures
  - SPF records
  - DMARC policies
  - STARTTLS encryption
- **Account Structure**:
  - Format: `username@cosmical.me`
  - Development prefix: `dev-` (development environment only)
  - Quota management per account

##### Web Server (`csmcl.space`)
- **Primary Role**: Web application and API services
- **API Endpoints Structure**:
  ```
  Base URL: https://mail.cosmical.me/api/v1
  
  Email Account Management:
  - Create Account:  POST   /mail/accounts
  - Check Account:   GET    /mail/accounts/:username
  - Delete Account:  DELETE /mail/accounts/:username
  ```
- **Authentication**:
  - Basic Authentication
  - Admin credentials required for account management
  - JWT for user sessions

#### 2. Integration Flow

1. **Account Creation Process**:
   ```
   User Registration
   └─> Web Server (csmcl.space)
       ├─> Validates request
       ├─> Creates email account via cosmical.me API
       │   └─> Configures on mail.cosmical.me
       └─> Returns account credentials
   ```

2. **Email Delivery Flow**:
   ```
   Outgoing Email
   └─> SMTP (mail.cosmical.me)
       ├─> DKIM signing
       ├─> SPF verification
       └─> DMARC policy check
   ```

#### 3. Security Measures

- **API Security**:
  - SSL/TLS encryption for all endpoints
  - Rate limiting on account creation
  - IP-based access controls
  - Request logging and monitoring

- **Email Security**:
  - Secure password generation
  - Forward-to address validation
  - Quota enforcement
  - Development environment isolation

#### 4. Development Considerations

- **Environment Separation**:
  - Development accounts prefixed with `dev-`
  - Reduced quotas in development
  - Full logging in development mode
  - Separate configuration for testing

- **Configuration Management**:
  - Environment variables for sensitive data
  - Separate SMTP and API configurations
  - Development-specific settings
  - Logging level controls

### User Registration Flow

1. **Initial Registration**:
   - Display Name (1-3 words)
   - CSMCL Name (for `@cosmical.me` email)
   - Regular Email (for verification)
   - SIM Number (for verification)
   - Password
   - Terms acceptance

2. **Verification Process**:
   - Email verification token
   - SIM verification code
   - Both must be verified for activation

3. **Account Creation**:
   - Mail account on `cosmical.me`
   - Home directory on `csmcl.space`
   - User profile setup

### Planned Features

1. **Account Lifecycle**:
   - Temporary accounts with expiration
   - KYC compliance system
   - Account permanence through verification

2. **Blockchain Integration**:
   - Flow Network integration
   - NFT minting capability
   - Token rewards system
   - Decentralized identity

3. **Public Space**:
   - User-controlled public data
   - Shared resources
   - Collaboration tools

### Development Environment

1. **Local Development**:
   - AlmaLinux development environment
   - Development scripts for easy setup
   - Comprehensive test suite

2. **Production Environment**:
   - Ubuntu 22.04 VPS
   - Separate mail and web servers
   - Production deployment scripts

### Security Measures

1. **Authentication**:
   - JWT-based authentication
   - Refresh token rotation
   - Password hashing with bcrypt

2. **Email Security** (`cosmical.me`):
   - DKIM for email authenticity
   - SPF for sender verification
   - DMARC for policy enforcement

3. **Web Security** (`csmcl.space`):
   - SSL/TLS encryption
   - CSRF protection
   - XSS prevention
   - Rate limiting

### Testing Strategy

1. **Unit Tests**:
   - Model validation
   - Service functions
   - Utility functions

2. **Integration Tests**:
   - API endpoints
   - Authentication flow
   - Email verification
   - SIM verification

3. **End-to-End Tests**:
   - User registration
   - Account verification
   - Profile management

## Future Roadmap

1. **Phase 1 - Core Infrastructure**:
   - Complete user authentication
   - Basic email and web services
   - Initial public space implementation

2. **Phase 2 - Blockchain Integration**:
   - Flow Network connection
   - NFT implementation
   - Token distribution system

3. **Phase 3 - Advanced Features**:
   - Enhanced collaboration tools
   - Extended public space capabilities
   - Advanced identity management

4. **Phase 4 - Scaling**:
   - Performance optimization
   - Enhanced security measures
   - Extended platform capabilities
