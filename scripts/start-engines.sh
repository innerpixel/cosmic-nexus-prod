#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local service=$1
    if systemctl is-active --quiet $service; then
        echo -e "${GREEN}✓ $service is running${NC}"
        return 0
    else
        echo -e "${RED}✗ $service is not running${NC}"
        return 1
    fi
}

# Function to start a service if it's not running
start_service() {
    local service=$1
    if ! check_service $service; then
        echo -e "${YELLOW}Starting $service...${NC}"
        sudo systemctl start $service
        if check_service $service; then
            echo -e "${GREEN}Successfully started $service${NC}"
        else
            echo -e "${RED}Failed to start $service${NC}"
            exit 1
        fi
    fi
}

echo -e "${YELLOW}Starting Cosmic Nexus Development Environment${NC}"
echo "=================================================="

# 1. Check MongoDB
echo -e "\n${YELLOW}Checking MongoDB...${NC}"
start_service mongod

# 2. Check Postfix
echo -e "\n${YELLOW}Checking Postfix...${NC}"
start_service postfix

# 3. Check Nginx
echo -e "\n${YELLOW}Checking Nginx...${NC}"
start_service nginx

# 4. Create required directories if they don't exist
echo -e "\n${YELLOW}Checking required directories...${NC}"
PROJECT_ROOT="/home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas"
STORAGE_DIR="$PROJECT_ROOT/server/storage/dev"
mkdir -p $STORAGE_DIR
echo -e "${GREEN}✓ Storage directory ready${NC}"

# 5. Check environment files
echo -e "\n${YELLOW}Checking environment files...${NC}"
if [ -f "$PROJECT_ROOT/server/.env.development" ]; then
    echo -e "${GREEN}✓ Development environment file exists${NC}"
else
    echo -e "${RED}✗ Development environment file missing${NC}"
    exit 1
fi

# 6. Final check
echo -e "\n${YELLOW}Final Status Check${NC}"
echo "=================================================="
check_service mongod
check_service postfix
check_service nginx

# If we got here, all services are running
echo -e "\n${GREEN}All engines are running! Ready to start the server.${NC}"
echo "=================================================="

# Optional: Start the development server
read -p "Do you want to start the development server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd $PROJECT_ROOT/server
    echo -e "${YELLOW}Starting development server...${NC}"
    npm run dev
fi
