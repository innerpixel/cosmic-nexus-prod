#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting deployment of Cosmic Nexus...${NC}"

# Project directories
PROJECT_ROOT="/home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas"
FRONTEND_DIR="$PROJECT_ROOT"
SERVER_DIR="$PROJECT_ROOT/server"

# Build frontend
echo -e "${BLUE}Building frontend...${NC}"
cd $FRONTEND_DIR
npm install
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Frontend build successful${NC}"
else
    echo "Frontend build failed"
    exit 1
fi

# Copy dist to web server directory
echo -e "${BLUE}Copying files to web server...${NC}"
sudo cp -r dist/* /var/www/local.csmcl-space/dist/

# Update and start backend
echo -e "${BLUE}Updating backend...${NC}"
cd $SERVER_DIR
npm install

# Kill any existing node processes
pkill -f "node.*src/index.js" || true

# Start the server in the background
echo -e "${BLUE}Starting server...${NC}"
NODE_ENV=development nohup node src/index.js > /var/log/cosmic-nexus.log 2>&1 &

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backend started successfully${NC}"
    echo -e "${BLUE}Server logs available at: /var/log/cosmic-nexus.log${NC}"
else
    echo "Backend start failed"
    exit 1
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${BLUE}Application is now running at: https://local-dev.test${NC}"
