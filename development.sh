#!/bin/bash

# Function to cleanup background processes
cleanup() {
    echo "Shutting down development servers..."
    kill $(jobs -p) 2>/dev/null
    wait
    echo "Development servers stopped"
}

# Set up trap for cleanup on script exit
trap cleanup EXIT

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to kill process by port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        print_status "Killing process on port $port (PID: $pid)"
        kill -9 $pid
    fi
}

# Function to wait for port to be available
wait_for_port() {
    local port=$1
    local timeout=$2
    local start_time=$(date +%s)
    
    while ! nc -z localhost $port; do
        if [ $(($(date +%s) - start_time)) -gt $timeout ]; then
            return 1
        fi
        sleep 1
    done
    return 0
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (sudo ./development.sh)"
    exit 1
fi

# Check and install required packages
print_status "Checking required packages..."
packages=("nginx" "mongodb-org" "nodejs" "npm")
for package in "${packages[@]}"; do
    if ! command -v $package &> /dev/null; then
        print_warning "$package is not installed. Installing..."
        dnf install -y $package
    fi
done

# Ensure MongoDB is running
print_status "Checking MongoDB..."
if ! systemctl is-active --quiet mongod; then
    print_status "Starting MongoDB..."
    systemctl start mongod
    sleep 2
fi

# Verify MongoDB user exists
print_status "Verifying MongoDB user..."
if ! mongosh admin --eval 'db.auth("cosmicnexus", "CosmicNexus2025!")' &>/dev/null; then
    print_status "Creating MongoDB user..."
    mongosh admin --eval 'db.createUser({user: "cosmicnexus", pwd: "CosmicNexus2025!", roles: [{role: "readWrite", db: "cosmic-nexus-dev"}, {role: "dbAdmin", db: "cosmic-nexus-dev"}]})'
fi

# Check and setup Nginx
print_status "Setting up Nginx..."
if [ ! -f "/etc/nginx/ssl/local.csmcl.space/local.crt" ]; then
    print_status "Setting up SSL certificate..."
    ./deployment/create-local-ssl.sh
fi

if [ ! -f "/etc/nginx/conf.d/local.csmcl.space.conf" ]; then
    print_status "Setting up Nginx configuration..."
    cp deployment/nginx/local.conf /etc/nginx/conf.d/local.csmcl.space.conf
fi

# Add local domain to hosts if not present
if ! grep -q "local.csmcl.space" /etc/hosts; then
    print_status "Adding local.csmcl.space to hosts file..."
    echo "127.0.0.1 local.csmcl.space" >> /etc/hosts
fi

# Restart Nginx
print_status "Restarting Nginx..."
systemctl restart nginx

# Create storage directories if they don't exist
print_status "Setting up storage directories..."
STORAGE_ROOT="./server/storage/dev"
mkdir -p "$STORAGE_ROOT/users"
chown -R $SUDO_USER:$SUDO_USER "$STORAGE_ROOT"
chmod 750 "$STORAGE_ROOT"
chmod 750 "$STORAGE_ROOT/users"

# Create log directories
print_status "Setting up log directories..."
mkdir -p server/logs
touch server/logs/server.log
touch server/logs/access.log
chown -R $SUDO_USER:$SUDO_USER server/logs
chmod 755 server/logs
chmod 644 server/logs/*.log

# Check environment files
print_status "Checking environment files..."
if [ ! -f "./server/.env.development" ]; then
    print_status "Creating development environment file..."
    cat > ./server/.env.development << EOL
# MongoDB
MONGODB_URI=mongodb://cosmicnexus:CosmicNexus2025!@localhost:27017/cosmic-nexus-dev?authSource=admin

# Development Mode (using Ethereal for email testing)
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Mail Configuration
MAIL_API_ENDPOINT=https://mail.cosmical.me/api/v1
MAIL_ADMIN_USER=admin@cosmical.me
MAIL_ADMIN_PASSWORD=your_admin_password
DEV_PREFIX=dev-
DEV_QUOTA_MB=100
MAIL_DOMAIN=cosmical.me

# Storage
STORAGE_ROOT=/home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas/server/storage/dev

# JWT
JWT_SECRET=development_secret_key_123
JWT_EXPIRES_IN=7d

# Server
PORT=5000
EOL
fi

# Export environment variables
set -a
source ./server/.env.development
set +a

# Kill any existing processes on our ports
print_status "Cleaning up existing processes..."
kill_port 5000  # Backend
kill_port 3000  # Frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    sudo -u $SUDO_USER npm install
fi

if [ ! -d "server/node_modules" ]; then
    print_status "Installing backend dependencies..."
    (cd server && sudo -u $SUDO_USER npm install)
fi

# Start development servers
print_status "Starting development servers..."

# Start backend server
print_status "Starting backend server..."
(cd server && sudo -u $SUDO_USER NODE_ENV=development npm run dev 2>&1 | tee -a logs/server.log) &

# Wait for backend to start
print_status "Waiting for backend server..."
if wait_for_port 5000 30; then
    print_status "Backend server started successfully on port 5000"
else
    print_error "Backend server failed to start within timeout"
    exit 1
fi

# Start frontend server
print_status "Starting frontend server..."
(sudo -u $SUDO_USER NODE_OPTIONS='--experimental-global-webcrypto' NODE_ENV=development npm run dev 2>&1 | tee -a server/logs/access.log) &

# Wait for frontend to start
print_status "Waiting for frontend server..."
if wait_for_port 3000 30; then
    print_status "Frontend server started successfully on port 3000"
else
    print_error "Frontend server failed to start within timeout"
    exit 1
fi

print_status "Development environment is ready!"
print_status "Access your site at: https://local.csmcl.space"
print_warning "Note: You'll see a certificate warning (self-signed certificate)"

# Keep script running and show logs
exec tail -f server/logs/*.log /var/log/nginx/local.csmcl.space.*.log
