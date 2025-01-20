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

# Check if MongoDB is installed and running
if ! command -v mongod &> /dev/null; then
    echo "MongoDB is not installed. Please install MongoDB first."
    exit 1
fi

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Function to kill process by port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port (PID: $pid)"
        kill -9 $pid
    fi
}

# Gracefully stop any running development servers
echo "Checking for running servers..."
kill_port 3000
kill_port 5000
sleep 2

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
npm install
cd ..

# Start MongoDB (if not already running)
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    sudo systemctl start mongod
fi

# Start development servers
echo "Starting development servers..."

# Start backend in development mode on port 5000
echo "Starting backend on port 5000..."
cd server
node --watch src/index.js &
cd ..

# Start frontend in development mode on port 3000
echo "Starting frontend on port 3000..."
VITE_PORT=3000 VITE_API_URL=http://localhost:5000 npm run dev &

# Wait for all background processes
wait
