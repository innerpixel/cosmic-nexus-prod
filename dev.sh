#!/bin/bash

# Function to check if a process is running on a port
check_port() {
    lsof -i:$1 >/dev/null 2>&1
}

# Function to kill process on a port
kill_port() {
    lsof -ti:$1 | xargs kill -9 2>/dev/null
}

# Clean up any existing processes
echo "Cleaning up existing processes..."
kill_port 5173  # Frontend
kill_port 3000  # Backend

# Start the frontend
echo "Starting frontend on port 5173..."
npm run dev &

# Start the backend
echo "Starting backend on port 3000..."
cd server && npm run dev &

# Wait for both services to be ready
echo "Waiting for services to start..."
until check_port 5173 && check_port 3000; do
    sleep 1
done

echo "Development environment is ready!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap 'kill $(jobs -p)' EXIT
wait
