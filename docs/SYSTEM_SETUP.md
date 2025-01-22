# System Setup Guide for Cosmic Nexus

This document outlines the necessary system configurations for running the Cosmic Nexus application, particularly focusing on user management and security settings.

## System Requirements

- AlmaLinux (Development) / Ubuntu 22.04 (Production)
- Node.js
- MongoDB
- Nginx
- Systemd

## User Management Setup

### 1. System Group Configuration

Create the CSMCL group for all application users:

```bash
# Create the csmcl group
sudo groupadd csmcl

# Set proper permissions for user storage
sudo mkdir -p /home/storage/users
sudo chown root:csmcl /home/storage/users
sudo chmod 2775 /home/storage/users  # SetGID bit
```

### 2. Sudo Configuration

The application needs specific sudo permissions to manage system users. Create a dedicated sudoers file:

```bash
# Create a new sudoers file for the application
sudo visudo -f /etc/sudoers.d/cosmic-nexus

# Add the following contents:
# Allow www-data to manage users without password
www-data ALL=(ALL) NOPASSWD: /usr/sbin/useradd
www-data ALL=(ALL) NOPASSWD: /usr/sbin/userdel
www-data ALL=(ALL) NOPASSWD: /usr/sbin/usermod
www-data ALL=(ALL) NOPASSWD: /usr/bin/chpasswd
```

### 3. Service Configuration

Update the systemd service to run with proper permissions:

```ini
[Unit]
Description=Cosmic Nexus Web Application
After=network.target mongodb.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/cosmic-nexus/backend
ExecStart=/usr/bin/node src/index.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

# Add required capabilities
AmbientCapabilities=CAP_NET_BIND_SERVICE
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/home/storage/users

[Install]
WantedBy=multi-user.target
```

### 4. Environment Configuration

Ensure proper environment variables are set:

```env
# Storage Configuration
STORAGE_PATH=/home/storage/users

# User Management
DEFAULT_USER_GROUP=csmcl
USER_HOME_BASE=/home/storage/users
```

## Security Considerations

1. **File Permissions**:
   - All user directories should be owned by the respective user
   - Parent directories should be owned by root:csmcl
   - SetGID bit should be set on parent directories

2. **User Isolation**:
   - Each user gets their own home directory
   - Users can only access their own files
   - Quota limits can be set per user

3. **System Security**:
   - Limited sudo permissions
   - Service runs with minimal required privileges
   - File system access is restricted

## Deployment Process

1. **Initial Setup**:
   ```bash
   # Create required directories
   sudo mkdir -p /var/www/cosmic-nexus
   sudo mkdir -p /home/storage/users

   # Set up user group
   sudo groupadd csmcl

   # Configure permissions
   sudo chown -R www-data:www-data /var/www/cosmic-nexus
   sudo chown root:csmcl /home/storage/users
   sudo chmod 2775 /home/storage/users
   ```

2. **Service Deployment**:
   ```bash
   # Copy service file
   sudo cp csmcl-space.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable csmcl-space
   sudo systemctl start csmcl-space
   ```

3. **Verify Setup**:
   ```bash
   # Check service status
   sudo systemctl status csmcl-space

   # Verify permissions
   ls -la /home/storage/users
   
   # Test user creation
   curl -X POST http://localhost:3000/api/auth/register -d '...'
   ```

## Troubleshooting

Common issues and their solutions:

1. **User Creation Fails**:
   - Check sudo permissions
   - Verify www-data user exists
   - Check system logs: `journalctl -u csmcl-space`

2. **Storage Access Issues**:
   - Verify directory permissions
   - Check SELinux context if enabled
   - Ensure proper group membership

3. **Service Start Fails**:
   - Check logs: `journalctl -u csmcl-space`
   - Verify environment variables
   - Check file permissions

## Maintenance

Regular maintenance tasks:

1. **User Cleanup**:
   - Remove inactive users
   - Clean up orphaned home directories

2. **Storage Management**:
   - Monitor disk usage
   - Enforce quotas
   - Backup user data

3. **Security Updates**:
   - Regular system updates
   - Review sudo permissions
   - Audit user access

## Development Environment

For local development:

1. **Use Development Config**:
   ```bash
   # Run with development settings
   NODE_ENV=development npm run dev
   ```

2. **Test User Management**:
   ```bash
   # Create test user
   curl -X POST http://localhost:5000/api/auth/register ...
   
   # Verify user creation
   ls -la /home/storage/users
   getent passwd testuser
   ```
