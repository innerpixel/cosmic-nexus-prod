# User Authentication Flow

This document details the complete user journey from guest to fully registered user in the Cosmic Nexus application.

## 1. Guest User Journey

### Initial Access
- User arrives at `csmcl.space`
- Lands on the public landing page
- Has access to:
  - Landing page
  - About page
  - Features page
  - Contact page
  - Login/Register options

## 2. Registration Process

### Step 1: Account Creation
- User clicks "Create Account" or "Register"
- Registration form requires:
  - Display Name
  - Email (must be valid format)
  - Password (minimum 8 characters)
  - Password confirmation
  - Terms of Service acceptance
- System validates:
  - Email format
  - Password strength
  - Terms acceptance
  - Display name length (minimum 3 characters)

### Step 2: Email Verification
- After successful registration:
  - System creates unverified account
  - Sends verification email to user's address
  - Redirects to email verification page
- Email contains:
  - Welcome message
  - Verification link
  - Link expiration time (24 hours)
- User must:
  - Click verification link in email
  - Return to application
  - See verification success message

### Step 3: Initial Login
- After email verification:
  - User is redirected to login page
  - Enters verified email and password
  - System validates credentials
  - Creates authenticated session
  - Issues JWT tokens:
    - Access token (short-lived)
    - Refresh token (long-lived)

## 3. Authentication States

### Unauthenticated (Guest)
- No access token
- Can only access public routes
- Redirected to login for protected routes

### Partially Authenticated
- Has valid tokens
- Email not verified
- Limited access to features
- Prompted to verify email

### Fully Authenticated
- Has valid tokens
- Email verified
- Full access to application features

## 4. Token Management

### Access Token
- Short lifespan (1 hour)
- Stored in memory
- Used for API requests
- Contains user claims

### Refresh Token
- Long lifespan (7 days)
- Stored in localStorage
- Used to obtain new access tokens
- Rotated on use

## 5. Session Management

### Token Refresh Flow
1. Access token expires
2. System attempts refresh
3. If successful:
   - New access token issued
   - Session continues
4. If failed:
   - User logged out
   - Redirected to login

### Manual Logout
1. User clicks logout
2. System:
   - Clears local tokens
   - Invalidates server session
   - Redirects to landing page

## 6. Security Measures

### Password Security
- Minimum 8 characters
- Hashed using bcrypt
- Never stored in plain text

### Email Security
- Verification required
- Anti-spam measures
- Rate limiting on attempts

### Session Security
- HTTPS only
- Secure cookie flags
- XSS protection headers
- CSRF protection

## 7. Error Handling

### Registration Errors
- Email already in use
- Invalid email format
- Weak password
- Terms not accepted

### Login Errors
- Invalid credentials
- Account not found
- Email not verified
- Too many attempts

### Verification Errors
- Invalid/expired token
- Already verified
- Token reuse attempt

## 8. Recovery Processes

### Password Reset
1. User requests reset
2. System sends reset email
3. User clicks reset link
4. User sets new password
5. All sessions invalidated
6. User must login again

### Email Verification Resend
1. User requests new verification
2. Old token invalidated
3. New email sent
4. 24-hour expiration

## 9. Protected Routes

### Routes Requiring Authentication
- Dashboard
- Profile
- Settings
- Application features

### Route Guards
- Check authentication state
- Verify token validity
- Handle redirect logic
- Maintain intended destination

## 10. API Integration

### Authentication Headers
```javascript
Authorization: Bearer ${accessToken}
```

### Request Flow
1. Client includes token
2. Server validates token
3. If valid:
   - Process request
   - Return response
4. If invalid:
   - Return 401/403
   - Client initiates refresh

## 11. Development Considerations

### Local Development
- Use development mail server
- Shorter token expiration
- Debug logging enabled
- Mock authentication option

### Production Environment
- Secure mail server (cosmical.me)
- Standard token expiration
- Minimal logging
- No mock options
