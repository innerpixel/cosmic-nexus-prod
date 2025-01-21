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

# Update and restart backend
echo -e "${BLUE}Updating backend...${NC}"
cd $SERVER_DIR
npm install

# Check if pm2 is running our app
if pm2 list | grep -q "cosmic-nexus"; then
    echo -e "${BLUE}Restarting existing service...${NC}"
    pm2 restart cosmic-nexus
else
    echo -e "${BLUE}Starting new service...${NC}"
    pm2 start src/index.js --name cosmic-nexus
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backend update successful${NC}"
else
    echo "Backend update failed"
    exit 1
fi

# Save PM2 configuration
pm2 save

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${BLUE}You can monitor the application using: pm2 monit${NC}"

# Show current status
pm2 status
