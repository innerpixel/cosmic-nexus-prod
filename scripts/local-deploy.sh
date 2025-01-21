#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="/home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas"
DEPLOY_DIR="/home/nsbasicus/local-deploy/var/www/cosmic-nexus"

echo -e "${YELLOW}Starting local deployment...${NC}"
echo "=================================================="

# Create necessary directories if they don't exist
echo -e "\n${YELLOW}Checking directory structure...${NC}"
mkdir -p ${DEPLOY_DIR}/{frontend/dist,backend}
mkdir -p ${PROJECT_ROOT}/{frontend,server}

# Copy backend files
echo -e "\n${YELLOW}Deploying backend...${NC}"
if [ -d "${PROJECT_ROOT}/server" ]; then
    cp -r ${PROJECT_ROOT}/server/* ${DEPLOY_DIR}/backend/
    cd ${DEPLOY_DIR}/backend
    echo -e "${GREEN}Installing backend dependencies...${NC}"
    npm install --production
else
    echo -e "${RED}Backend directory not found${NC}"
    exit 1
fi

# Build and copy frontend files
echo -e "\n${YELLOW}Building frontend...${NC}"
if [ -d "${PROJECT_ROOT}/frontend" ]; then
    cd ${PROJECT_ROOT}/frontend
    if [ ! -f "package.json" ]; then
        echo -e "${YELLOW}Initializing frontend project...${NC}"
        npm init vite@latest . -- --template vue
        npm install
    fi
    npm run build
    echo -e "${GREEN}Copying frontend files...${NC}"
    cp -r dist/* ${DEPLOY_DIR}/frontend/dist/
else
    echo -e "${RED}Frontend directory not found${NC}"
    exit 1
fi

# Configure and restart services
echo -e "\n${YELLOW}Configuring services...${NC}"

# Create nginx symlink if it doesn't exist
if [ ! -L "/etc/nginx/conf.d/cosmic-nexus.conf" ]; then
    sudo ln -s ${DEPLOY_DIR}/etc/nginx/conf.d/cosmic-nexus.conf /etc/nginx/conf.d/
fi

# Restart nginx
echo -e "${YELLOW}Restarting Nginx...${NC}"
sudo systemctl restart nginx

# Start/Restart PM2 process
echo -e "${YELLOW}Starting application with PM2...${NC}"
cd ${DEPLOY_DIR}/backend
if pm2 list | grep -q "cosmic-nexus-api"; then
    pm2 restart cosmic-nexus-api
else
    pm2 start app.js --name cosmic-nexus-api
fi

echo -e "\n${GREEN}Deployment complete!${NC}"
echo "=================================================="
echo -e "${YELLOW}Access your application:${NC}"
echo "Frontend: http://local.csmcl.space"
echo "API: http://local.csmcl.space/api"
echo -e "\n${YELLOW}View logs:${NC}"
echo "Frontend: tail -f ${DEPLOY_DIR}/frontend/dist/access.log"
echo "Backend: pm2 logs cosmic-nexus-api"
