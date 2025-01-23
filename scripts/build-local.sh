#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting local build process..."

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the frontend
echo "🏗️ Building frontend..."
npm run build

# Ensure the nginx directory exists
sudo mkdir -p /var/www/cosmic-nexus/frontend

# Copy the built files
echo "📋 Copying files to nginx directory..."
sudo rm -rf /var/www/cosmic-nexus/frontend/*
sudo cp -r dist/* /var/www/cosmic-nexus/frontend/

# Set proper permissions
echo "🔒 Setting permissions..."
sudo chown -R nginx:nginx /var/www/cosmic-nexus/frontend
sudo chmod -R 755 /var/www/cosmic-nexus/frontend

echo "✅ Build complete! Frontend is now available at https://local-dev.test"
