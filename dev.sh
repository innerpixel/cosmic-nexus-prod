#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Development ports (different from local-dev.test)
FRONTEND_PORT=3001
BACKEND_PORT=5001

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo -e "${YELLOW}Starting development environment...${NC}"
echo -e "${GREEN}Development URLs:${NC}"
echo -e "  Frontend: http://localhost:${FRONTEND_PORT}"
echo -e "  Backend:  http://localhost:${BACKEND_PORT}"
echo -e "\n${GREEN}Deployed URLs:${NC}"
echo -e "  Local Site: https://local-dev.test"

# Function to display status
show_status() {
    echo -e "\n${GREEN}Development Services Status:${NC}"
    
    # Check Frontend
    if check_port $FRONTEND_PORT; then
        if check_frontend_health $FRONTEND_PORT; then
            echo -e "  Frontend: ${GREEN}Running on http://localhost:${FRONTEND_PORT}${NC}"
        else
            echo -e "  Frontend: ${RED}Port ${FRONTEND_PORT} in use but service not responding${NC}"
        fi
    else
        echo -e "  Frontend: ${RED}Not running${NC}"
    fi
    
    # Check Backend
    if check_port $BACKEND_PORT; then
        if check_backend_health $BACKEND_PORT; then
            echo -e "  Backend:  ${GREEN}Running on http://localhost:${BACKEND_PORT}${NC}"
        else
            echo -e "  Backend:  ${RED}Port ${BACKEND_PORT} in use but service not responding${NC}"
        fi
    else
        echo -e "  Backend:  ${RED}Not running${NC}"
    fi
    
    echo -e "\nOptions:"
    echo -e "  ${YELLOW}1${NC}) Restart frontend (dev)"
    echo -e "  ${YELLOW}2${NC}) Restart backend (dev)"
    echo -e "  ${YELLOW}3${NC}) Restart both (dev)"
    echo -e "  ${YELLOW}s${NC}) Show deployed site status"
    echo -e "  ${YELLOW}q${NC}) Quit"
    echo -e "\nPress a key to choose an option..."
}

# Function to check if a port is in use
check_port() {
    nc -z localhost $1 >/dev/null 2>&1
    return $?
}

# Function to check if frontend is responding
check_frontend_health() {
    local port=$1
    curl -s http://localhost:$port | grep -q "vite" >/dev/null 2>&1
    return $?
}

# Function to check if backend is responding
check_backend_health() {
    local port=$1
    curl -s http://localhost:$port/api/health >/dev/null 2>&1
    return $?
}

# Function to show deployed site status
show_deployed_status() {
    echo -e "\n${GREEN}Checking deployed services (local-dev.test):${NC}"
    
    # Check nginx
    if systemctl is-active --quiet nginx; then
        echo -e "  Nginx:    ${GREEN}Running${NC}"
    else
        echo -e "  Nginx:    ${RED}Not running${NC}"
    fi
    
    # Check deployed backend
    if check_port 5000; then
        if check_backend_health 5000; then
            echo -e "  Backend:  ${GREEN}Running${NC}"
        else
            echo -e "  Backend:  ${RED}Port in use but not responding${NC}"
        fi
    else
        echo -e "  Backend:  ${RED}Not running${NC}"
    fi
    
    echo -e "\nDeployed site: ${GREEN}https://local-dev.test${NC}"
    echo -e "\nPress any key to return to menu..."
    read -n 1
}

# Function to stop process on port
stop_port() {
    local port=$1
    if check_port $port; then
        echo -e "${YELLOW}→ Stopping service on port $port...${NC}"
        
        # Try fuser first
        fuser -k -n tcp $port >/dev/null 2>&1
        
        # Also try lsof
        pid=$(lsof -ti:$port)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Killing process $pid on port $port${NC}"
            kill -9 $pid 2>/dev/null
        fi
        
        # Wait for the port to be actually free
        local max_attempts=5
        local attempt=1
        while check_port $port && [ $attempt -le $max_attempts ]; do
            echo -e "${YELLOW}Waiting for port $port to be released (attempt $attempt/$max_attempts)...${NC}"
            sleep 1
            attempt=$((attempt + 1))
        done
        
        if check_port $port; then
            echo -e "${RED}Failed to free port $port${NC}"
            return 1
        fi
        echo -e "${GREEN}Port $port successfully released${NC}"
    fi
    return 0
}

# Start backend if not running
if ! check_port $BACKEND_PORT; then
    echo -e "${YELLOW}→ Starting development backend server on port ${BACKEND_PORT}...${NC}"
    cd "$SCRIPT_DIR/backend" && PORT=$BACKEND_PORT node src/index.js &
    
    # Wait for backend to start (with timeout)
    max_attempts=10
    attempt=1
    while ! check_backend_health $BACKEND_PORT && [ $attempt -le $max_attempts ]; do
        echo -e "${YELLOW}Waiting for backend to start (attempt $attempt/$max_attempts)...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if check_backend_health $BACKEND_PORT; then
        echo -e "${GREEN}✓ Development backend started successfully${NC}"
    else
        echo -e "${RED}✗ Development backend failed to start${NC}"
        exit 1
    fi
fi

# Start frontend if not running
if ! check_port $FRONTEND_PORT; then
    echo -e "${YELLOW}→ Starting development frontend server on port ${FRONTEND_PORT}...${NC}"
    cd "$SCRIPT_DIR/frontend" && npm run dev -- --port $FRONTEND_PORT &
    sleep 3
fi

# Main menu loop
while true; do
    show_status
    read -n 1 choice
    echo ""
    case $choice in
        1)
            if stop_port $FRONTEND_PORT; then
                echo -e "${YELLOW}→ Starting frontend server on port ${FRONTEND_PORT}...${NC}"
                cd "$SCRIPT_DIR/frontend" && npm run dev -- --port $FRONTEND_PORT &
                sleep 2
            fi
            ;;
        2)
            if stop_port $BACKEND_PORT; then
                echo -e "${YELLOW}→ Starting backend server on port ${BACKEND_PORT}...${NC}"
                cd "$SCRIPT_DIR/backend" && PORT=$BACKEND_PORT node src/index.js &
                sleep 2
            fi
            ;;
        3)
            if stop_port $FRONTEND_PORT && stop_port $BACKEND_PORT; then
                echo -e "${YELLOW}→ Starting backend server on port ${BACKEND_PORT}...${NC}"
                cd "$SCRIPT_DIR/backend" && PORT=$BACKEND_PORT node src/index.js &
                sleep 2
                echo -e "${YELLOW}→ Starting frontend server on port ${FRONTEND_PORT}...${NC}"
                cd "$SCRIPT_DIR/frontend" && npm run dev -- --port $FRONTEND_PORT &
                sleep 2
            fi
            ;;
        s|S)
            show_deployed_status
            ;;
        q|Q)
            echo -e "${GREEN}Stopping development servers...${NC}"
            stop_port $FRONTEND_PORT
            stop_port $BACKEND_PORT
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            sleep 1
            ;;
    esac
done

# Cleanup on exit
trap 'kill $(jobs -p)' EXIT
