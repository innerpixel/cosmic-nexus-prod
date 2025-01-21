#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directories
LOCAL_DEPLOY_ROOT="/home/nsbasicus/local-deploy"
PROJECT_NAME="cosmic-nexus"
PROJECT_ROOT="/home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas"

echo -e "${YELLOW}Setting up local deployment environment${NC}"
echo "=================================================="

# Create directory structure
echo -e "\n${YELLOW}Creating directory structure...${NC}"
sudo mkdir -p ${LOCAL_DEPLOY_ROOT}/var/www/${PROJECT_NAME}
sudo mkdir -p ${LOCAL_DEPLOY_ROOT}/etc/nginx/conf.d
sudo mkdir -p ${LOCAL_DEPLOY_ROOT}/etc/letsencrypt/live/csmcl.space
sudo mkdir -p ${LOCAL_DEPLOY_ROOT}/var/log/${PROJECT_NAME}
sudo mkdir -p ${LOCAL_DEPLOY_ROOT}/var/log/nginx

# Set permissions
echo -e "\n${YELLOW}Setting permissions...${NC}"
sudo chown -R $USER:$USER ${LOCAL_DEPLOY_ROOT}

# Create nginx configuration
echo -e "\n${YELLOW}Creating Nginx configuration...${NC}"
cat > ${LOCAL_DEPLOY_ROOT}/etc/nginx/conf.d/${PROJECT_NAME}.conf << 'EOL'
server {
    listen 80;
    server_name local.csmcl.space;

    # Frontend
    location / {
        root /var/www/cosmic-nexus/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Logs
    access_log /var/log/cosmic-nexus/access.log;
    error_log /var/log/cosmic-nexus/error.log;
}
EOL

# Create symbolic links for easy access
echo -e "\n${YELLOW}Creating symbolic links...${NC}"
ln -sf ${LOCAL_DEPLOY_ROOT}/var/www/${PROJECT_NAME} ${PROJECT_ROOT}/deploy
ln -sf ${LOCAL_DEPLOY_ROOT}/var/log/${PROJECT_NAME} ${PROJECT_ROOT}/logs

# Add local.csmcl.space to /etc/hosts
echo -e "\n${YELLOW}Adding local domain to /etc/hosts...${NC}"
if ! grep -q "local.csmcl.space" /etc/hosts; then
    echo "127.0.0.1 local.csmcl.space" | sudo tee -a /etc/hosts
fi

# Create deploy script
echo -e "\n${YELLOW}Creating deployment script...${NC}"
cat > ${PROJECT_ROOT}/scripts/local-deploy.sh << 'EOL'
#!/bin/bash
PROJECT_ROOT="/home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas"
DEPLOY_DIR="/home/nsbasicus/local-deploy/var/www/cosmic-nexus"

# Build frontend
cd ${PROJECT_ROOT}/frontend
npm run build

# Copy frontend files
cp -r dist/* ${DEPLOY_DIR}/frontend/dist/

# Copy backend files
cd ${PROJECT_ROOT}/server
cp -r . ${DEPLOY_DIR}/backend/
cd ${DEPLOY_DIR}/backend
npm install --production

# Restart services
sudo systemctl restart nginx
pm2 restart cosmic-nexus-api || pm2 start app.js --name cosmic-nexus-api
EOL

chmod +x ${PROJECT_ROOT}/scripts/local-deploy.sh

echo -e "\n${GREEN}Local deployment environment setup complete!${NC}"
echo "=================================================="
echo -e "${YELLOW}Directory structure:${NC}"
echo "- Web root: ${LOCAL_DEPLOY_ROOT}/var/www/${PROJECT_NAME}"
echo "- Nginx config: ${LOCAL_DEPLOY_ROOT}/etc/nginx/conf.d"
echo "- Logs: ${LOCAL_DEPLOY_ROOT}/var/log/${PROJECT_NAME}"
echo -e "\n${YELLOW}Quick access:${NC}"
echo "- Deployment directory: ${PROJECT_ROOT}/deploy"
echo "- Logs directory: ${PROJECT_ROOT}/logs"
echo -e "\n${YELLOW}To deploy:${NC}"
echo "./scripts/local-deploy.sh"
echo -e "\n${YELLOW}Access the app:${NC}"
echo "http://local.csmcl.space"
