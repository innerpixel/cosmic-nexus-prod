#!/bin/bash

# Production setup
if [ "$NODE_ENV" = "production" ]; then
    # Create storage directories
    mkdir -p /var/www/csmcl.space/storage/users
    
    # Set ownership
    chown -R www-data:www-data /var/www/csmcl.space
    
    # Set base permissions
    chmod 755 /var/www/csmcl.space
    chmod 750 /var/www/csmcl.space/storage
    chmod 750 /var/www/csmcl.space/storage/users
    
    # Set ACLs for future directories
    setfacl -R -d -m u:www-data:rwx /var/www/csmcl.space/storage/users
    
    echo "Production permissions set"
else
    # Development setup
    STORAGE_ROOT="./storage/dev"
    
    # Create development directories
    mkdir -p "$STORAGE_ROOT/users"
    
    # Set development permissions
    chmod -R 755 "$STORAGE_ROOT"
    
    echo "Development permissions set"
fi

# Verify permissions
echo "Verifying permissions..."
ls -la /var/www/csmcl.space/storage 2>/dev/null || ls -la ./storage/dev
