# Development Guide

## Getting Started

### Prerequisites
- Node.js v20.17.0 or higher
- MongoDB 5.0 or higher
- Nginx
- Postfix
- Git

### Tech Stack
- **Frontend**: Vue.js 3 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Mail Server**: Local Postfix (dev) / cosmical.me (prod)
- **Web Server**: Nginx

## Local Development Environment

### 1. Clone the Repository
```bash
git clone <repository-url>
cd StarterTemplateDesignIdeas
```

### 2. Set Up Local Domain
Add to `/etc/hosts`:
```
127.0.0.1 local-dev.test
```

### 3. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 4. Configure Environment
Create `.env.development` in project root:
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

### 5. Start Development Servers

#### Frontend Development
```bash
npm run dev
```

#### Backend Development
```bash
cd server
npm run dev
```

## Development Workflow

### Git Branches
- `main`: Production-ready code
- `stable-auth`: Stable authentication system
- `feature/auth-testing`: Authentication testing features
- `feature/*`: New features

### Local Git Setup
```bash
# Add local remote for development
git remote add local /var/git/local.csmcl-space.git

# Push to local development server
git push local <branch-name>
```

### Code Style
- Use ESLint and Prettier for code formatting
- Follow Vue.js style guide
- Use TypeScript for type safety
- Write meaningful commit messages

## Testing

### Unit Tests
```bash
# Run frontend tests
npm run test:unit

# Run backend tests
cd server
npm run test
```

### User Flow Tests
```bash
cd server
NODE_ENV=development npm run test:users
```

### Mail Testing
- Check `/var/log/maillog` for mail delivery logs
- Use local postfix for development
- Monitor mail queue with `mailq`

## Building

### Production Build
```bash
# Build frontend
npm run build

# Start production server
cd server
NODE_ENV=production node src/index.js
```

### Local Deployment
```bash
# Deploy to local development server
./deployment/deploy-app.sh
```

## Debugging

### Frontend
- Vue DevTools for component inspection
- Browser DevTools for network/console
- Vite debugging tools

### Backend
- Use `console.log` for basic debugging
- Check `/var/log/cosmic-nexus.log`
- MongoDB logs in `/var/log/mongodb/mongod.log`

### Mail
- Check `/var/log/maillog`
- Monitor postfix queue
- Test mail delivery with `mail` command

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
```javascript
{
  "displayName": "string",
  "csmclName": "string",
  "regularEmail": "string",
  "simNumber": "string",
  "password": "string"
}
```

#### POST /api/auth/verify-email
```javascript
{
  "token": "string"
}
```

#### POST /api/auth/login
```javascript
{
  "email": "string",
  "password": "string"
}
```

## Common Development Tasks

### 1. Creating New Components
```bash
# Create new component
touch src/components/NewComponent.vue
```

### 2. Adding Routes
Edit `src/router/index.js`:
```javascript
{
  path: '/new-route',
  component: () => import('@/views/NewView.vue')
}
```

### 3. Database Operations
```bash
# Access MongoDB shell
mongosh cosmic-nexus

# Backup database
mongodump --db cosmic-nexus

# Restore database
mongorestore --db cosmic-nexus dump/cosmic-nexus
```

### 4. Nginx Configuration
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo nginx -s reload
```

## Troubleshooting Development

### 1. Frontend Issues
- Clear browser cache
- Check Vue DevTools
- Verify environment variables
- Check build output

### 2. Backend Issues
- Check server logs
- Verify MongoDB connection
- Test API endpoints
- Check environment variables

### 3. Database Issues
- Verify MongoDB service
- Check connection string
- Review indexes
- Monitor performance

### 4. Mail Issues
- Check postfix status
- Review mail logs
- Test mail delivery
- Verify DNS settings
