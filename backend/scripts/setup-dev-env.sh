#!/bin/bash

# Script to set up development environment for CSMCL user testing

# Create csmcl group if it doesn't exist
sudo groupadd -f csmcl

# Create mail spool directory if it doesn't exist
sudo mkdir -p /var/spool/mail
sudo chmod 1777 /var/spool/mail

# Create storage directories
sudo mkdir -p /home/storage/users
sudo chown root:csmcl /home/storage/users
sudo chmod 2775 /home/storage/users  # SetGID bit

# Create mail directory
sudo mkdir -p /home/mail
sudo chown root:csmcl /home/mail
sudo chmod 2775 /home/mail

# Set up default quotas (100MB for development)
sudo quotacheck -cug /home
sudo quotaon -v /home

echo "Development environment setup complete"
