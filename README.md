# Cosmic Nexus

A modern web application for space exploration and community engagement. Built with Vue 3 and Express, featuring a robust authentication system and beautiful UI design.

## Features

- **Authentication System**
  - Secure user registration and login
  - Email verification
  - Password reset functionality
  - JWT-based authentication

- **Modern UI/UX**
  - Responsive design with TailwindCSS
  - Dark mode support
  - Interactive components
  - Form validation with vee-validate and zod

- **Backend Services**
  - RESTful API with Express
  - MongoDB database integration
  - Email service integration
  - Health check endpoints

## Technologies

### Frontend
- Vue 3 (Composition API)
- Vite
- TailwindCSS
- Vee-validate with Zod
- Vue Router
- Pinia for state management

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- Nodemailer for emails

### Infrastructure
- Nginx for web server
- Systemd for service management
- GitHub Actions for CI/CD
- SSL/TLS encryption

## Repository Setup

This repository is configured with two remotes:
- `production`: GitHub repository (git@github.com:innerpixel/cosmic-nexus-prod.git)
- `local`: Local development server (/srv/git/cosmic-nexus.git)

To push changes:
```bash
# Push to GitHub (production)
git push production main

# Push to local development server
git push local main

# Push to both remotes
git push --all
```

## Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cosmic-nexus
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Backend configuration (.env)
   NODE_ENV=development
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   MAIL_HOST=your_mail_host
   MAIL_PORT=your_mail_port
   MAIL_USER=your_mail_user
   MAIL_FROM=your_mail_from
   ```

4. Start development servers:
   ```bash
   # Using the development script
   ./dev.sh
   ```

   This will start:
   - Frontend on http://localhost:3001
   - Backend on http://localhost:5001

## Development Environments

### Local Development
- Frontend: http://localhost:3001
- Backend: http://localhost:5001
- Hot-reloading enabled
- Independent of deployed version

### Local Deployment (local-dev.test)
- URL: https://local-dev.test
- Nginx served
- Mirrors production setup
- Updates via git push to local branch

### Production
- URL: https://csmcl.space
- Automated deployment via GitHub Actions
- SSL/TLS encryption
- Systemd service management

## Available Scripts

- `dev.sh`: Development environment manager
  - Start/stop frontend and backend servers
  - Monitor service health
  - Switch between development ports
  - Check deployed services status

## Deployment

### Local Deployment
```bash
# Push to local repository
git push local main
```

### Production Deployment
```bash
# Push to production repository
git push production main
```

GitHub Actions will automatically deploy to production when pushing to the main branch.

## Directory Structure

```
cosmic-nexus/
├── frontend/           # Vue 3 frontend application
├── backend/           # Express backend server
├── .github/           # GitHub Actions workflows
├── nginx/            # Nginx configuration
└── dev.sh            # Development environment script
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test in local-dev.test environment
4. Submit a pull request

## License

MIT License

## Author

Created by CSMCL
