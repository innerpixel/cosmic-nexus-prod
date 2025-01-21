#!/bin/bash

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root"
    exit 1
fi

# Create SSL directory if it doesn't exist
SSL_DIR="/etc/nginx/ssl/local.csmcl.space"
mkdir -p "$SSL_DIR"

# Generate SSL certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$SSL_DIR/local.key" \
    -out "$SSL_DIR/local.crt" \
    -subj "/C=US/ST=California/L=Silicon Valley/O=Cosmic Development/CN=local.csmcl.space"

# Set proper permissions
chmod 600 "$SSL_DIR/local.key"
chmod 644 "$SSL_DIR/local.crt"
chown cosmic-web:cosmic-web "$SSL_DIR/local.key" "$SSL_DIR/local.crt"

echo "SSL certificate created at: $SSL_DIR"
