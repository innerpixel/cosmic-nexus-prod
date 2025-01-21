#!/bin/bash

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root"
    exit 1
fi

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "Installing nginx..."
    dnf install -y nginx
fi

# Create system user for local development (similar to www-data on Ubuntu)
if ! id -u cosmic-web &> /dev/null; then
    useradd -r -s /sbin/nologin cosmic-web
fi

# Create necessary directories
PROJECT_ROOT="/home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas"
STORAGE_ROOT="$PROJECT_ROOT/storage/dev"

mkdir -p "$STORAGE_ROOT/users"
mkdir -p /var/log/nginx

# Set up permissions
chown -R cosmic-web:cosmic-web "$STORAGE_ROOT"
chmod 750 "$STORAGE_ROOT"
chmod 750 "$STORAGE_ROOT/users"

# Set up ACLs for future directories
setfacl -R -d -m u:cosmic-web:rwx "$STORAGE_ROOT/users"

# Configure nginx
NGINX_CONF="/etc/nginx/conf.d/local.csmcl.space.conf"
cp "$PROJECT_ROOT/deployment/nginx/local.conf" "$NGINX_CONF"

# Add local domain to hosts file if not present
if ! grep -q "local.csmcl.space" /etc/hosts; then
    echo "127.0.0.1 local.csmcl.space" >> /etc/hosts
fi

# Set SELinux context if enabled
if command -v semanage &> /dev/null; then
    echo "Setting SELinux context..."
    semanage fcontext -a -t httpd_sys_content_t "$STORAGE_ROOT(/.*)?"
    restorecon -Rv "$STORAGE_ROOT"
fi

# Start and enable nginx
systemctl enable nginx
systemctl restart nginx

echo "Local environment setup complete!"
echo "Access your local development site at: http://local.csmcl.space"
echo ""
echo "Development storage path: $STORAGE_ROOT"
echo "Nginx config: $NGINX_CONF"
echo "User: cosmic-web (similar to www-data)"
