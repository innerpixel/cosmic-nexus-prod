#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo -e "${YELLOW}Checking development environment...${NC}"

# Function to display status
show_status() {
    echo -e "\n${GREEN}Services status:${NC}"
    echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
    echo -e "  Backend:  ${GREEN}http://localhost:5000${NC}"
    echo -e "\nOptions:"
    echo -e "  ${YELLOW}1${NC}) Restart frontend"
    echo -e "  ${YELLOW}2${NC}) Restart backend"
    echo -e "  ${YELLOW}3${NC}) Restart both"
    echo -e "  ${YELLOW}q${NC}) Quit"
    echo -e "\nPress a key to choose an option..."
}

# Function to check if a port is in use
check_port() {
    nc -z localhost $1 >/dev/null 2>&1
    return $?
}

# Function to check if backend is responding
check_backend_health() {
    curl -s http://localhost:5000/api/health >/dev/null 2>&1
    return $?
}

# Function to stop process on port
stop_port() {
    local port=$1
    if check_port $port; then
        echo -e "${YELLOW}→ Stopping service on port $port...${NC}"
        fuser -k $port/tcp >/dev/null 2>&1
        sleep 2
    fi
}

# Check backend status
if check_port 5000; then
    if check_backend_health; then
        echo -e "${GREEN}✓ Backend is running and healthy on port 5000${NC}"
    else
        echo -e "${RED}✗ Something is running on port 5000 but it's not our backend${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}→ Starting backend server on port 5000...${NC}"
    cd "$SCRIPT_DIR/backend" && npm start &
    
    # Wait for backend to start (with timeout)
    max_attempts=10
    attempt=1
    while ! check_backend_health && [ $attempt -le $max_attempts ]; do
        echo -e "${YELLOW}Waiting for backend to start (attempt $attempt/$max_attempts)...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if check_backend_health; then
        echo -e "${GREEN}✓ Backend started successfully${NC}"
    else
        echo -e "${RED}✗ Backend failed to start${NC}"
        exit 1
    fi
fi

# Check frontend status
if check_port 3000; then
    echo -e "${GREEN}✓ Frontend is already running on port 3000${NC}"
else
    echo -e "${YELLOW}→ Starting frontend server on port 3000...${NC}"
    cd "$SCRIPT_DIR/frontend" && npm run dev -- --port 3000
fi

# Check services status
both_running=false
if check_port 5000 && check_backend_health && check_port 3000; then
    echo -e "${GREEN}✓ All services are running${NC}"
    both_running=true
fi

if [ "$both_running" = true ]; then
    while true; do
        show_status
        read -n 1 choice
        echo ""
        case $choice in
            1)
                stop_port 3000
                echo -e "${YELLOW}→ Starting frontend server on port 3000...${NC}"
                cd "$SCRIPT_DIR/frontend" && npm run dev -- --port 3000
                ;;
            2)
                stop_port 5000
                echo -e "${YELLOW}→ Starting backend server on port 5000...${NC}"
                cd "$SCRIPT_DIR/backend" && npm start &
                sleep 5
                ;;
            3)
                stop_port 3000
                stop_port 5000
                echo -e "${YELLOW}→ Starting backend server on port 5000...${NC}"
                cd "$SCRIPT_DIR/backend" && npm start &
                sleep 5
                echo -e "${YELLOW}→ Starting frontend server on port 3000...${NC}"
                cd "$SCRIPT_DIR/frontend" && npm run dev -- --port 3000
                ;;
            q|Q)
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                ;;
        esac
    done
fi

# Cleanup on exit
trap 'kill $(jobs -p)' EXIT
