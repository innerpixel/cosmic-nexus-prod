#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (sudo ./setup-local-mailserver.sh)"
    exit 1
fi

# Install required packages
print_status "Installing mail server packages..."
dnf install -y postfix dovecot mailx cyrus-sasl cyrus-sasl-plain

# Backup original configs
print_status "Backing up original configurations..."
cp /etc/postfix/main.cf /etc/postfix/main.cf.bak
cp /etc/dovecot/dovecot.conf /etc/dovecot/dovecot.conf.bak

# Configure Postfix
print_status "Configuring Postfix..."
cat > /etc/postfix/main.cf << EOL
# Basic Configuration
myhostname = local.csmcl.space
mydomain = local.csmcl.space
myorigin = \$mydomain
inet_interfaces = all
inet_protocols = ipv4
mydestination = \$myhostname, localhost.\$mydomain, localhost, \$mydomain
mynetworks = 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16

# TLS parameters
smtpd_tls_cert_file=/etc/nginx/ssl/local.csmcl.space/local.crt
smtpd_tls_key_file=/etc/nginx/ssl/local.csmcl.space/local.key
smtpd_use_tls=yes
smtpd_tls_auth_only = yes
smtp_tls_security_level = may
smtpd_tls_security_level = may

# Authentication
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes
smtpd_recipient_restrictions = permit_sasl_authenticated, permit_mynetworks, reject_unauth_destination
EOL

# Configure Dovecot
print_status "Configuring Dovecot..."
cat > /etc/dovecot/dovecot.conf << EOL
protocols = imap pop3 lmtp
listen = *

ssl = yes
ssl_cert = </etc/nginx/ssl/local.csmcl.space/local.crt
ssl_key = </etc/nginx/ssl/local.csmcl.space/local.key

mail_location = mbox:~/mail:INBOX=/var/mail/%u

userdb {
  driver = passwd
}

passdb {
  driver = passwd-file
  args = scheme=SHA512-CRYPT username_format=%u /etc/dovecot/users
}

service auth {
  unix_listener auth-userdb {
    mode = 0600
    user = postfix
    group = postfix
  }

  unix_listener /var/spool/postfix/private/auth {
    mode = 0666
    user = postfix
    group = postfix
  }
}
EOL

# Create users file for Dovecot
print_status "Creating mail users..."
mkdir -p /etc/dovecot/users
echo "noreply@local.csmcl.space:{SHA512-CRYPT}$(openssl passwd -6 -salt xyz local_dev_pass)" > /etc/dovecot/users

# Create mail directories
print_status "Creating mail directories..."
mkdir -p /var/mail/noreply
chown -R postfix:postfix /var/mail
chmod -R 0770 /var/mail

# Update development environment variables
print_status "Updating development environment..."
sed -i 's/^MAIL_HOST=.*/MAIL_HOST=local.csmcl.space/' ../server/.env.development
sed -i 's/^MAIL_USER=.*/MAIL_USER=noreply@local.csmcl.space/' ../server/.env.development
sed -i 's/^MAIL_PASSWORD=.*/MAIL_PASSWORD=local_dev_pass/' ../server/.env.development
sed -i 's/^MAIL_FROM=.*/MAIL_FROM="Cosmic Nexus <noreply@local.csmcl.space>"/' ../server/.env.development
sed -i 's/^MAIL_DOMAIN=.*/MAIL_DOMAIN=local.csmcl.space/' ../server/.env.development

# Start services
print_status "Starting mail services..."
systemctl enable postfix dovecot
systemctl restart postfix dovecot

print_status "Local mail server setup complete!"
print_status "Mail server details:"
echo "   SMTP Host: local.csmcl.space"
echo "   SMTP Port: 587"
echo "   Username: noreply@local.csmcl.space"
echo "   Password: local_dev_pass"
echo ""
print_warning "Note: Add 'local.csmcl.space' to your /etc/hosts if not already present"
