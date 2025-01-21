# Deployment Guide

This document describes the deployment setup and access configuration for the Cosmic Nexus application.

## Server Infrastructure

### VPS Configuration
- **Web Server**: csmcl.space (Ubuntu 22.04)
- **Mail Server**: cosmical.me
- **Domain Configuration**:
  - `csmcl.space`: Web server with SSL
  - `cosmical.me`: Dedicated mail server (no web content)

## SSH Access

### Deployment Key
- **Location**: `~/.ssh/vps-deployment-key`
- **Public Key**: `~/.ssh/vps-deployment-key.pub`
- **Permissions**:
  ```bash
  # Private key (should be 600)
  -rw------- (600) ~/.ssh/vps-deployment-key
  
  # Public key (should be 644)
  -rw-r--r-- (644) ~/.ssh/vps-deployment-key.pub
  ```

### SSH Connection
```bash
# Basic connection
ssh -i ~/.ssh/vps-deployment-key root@csmcl.space

# Test connection
ssh -i ~/.ssh/vps-deployment-key -o BatchMode=yes root@csmcl.space echo "Connection test"
```

### SSH Configuration
Add this to your `~/.ssh/config` for easier access:
```
Host csmcl.space
    HostName csmcl.space
    User root
    IdentityFile ~/.ssh/vps-deployment-key
    IdentitiesOnly yes
```

With this configuration, you can simply use:
```bash
ssh csmcl.space
```

## Security Considerations

1. **Key Protection**:
   - Never share the private key
   - Keep backup of the key in a secure location
   - Use passphrase protection for additional security

2. **Access Control**:
   - Limit root SSH access to specific IPs if possible
   - Use fail2ban to prevent brute force attempts
   - Regularly audit SSH access logs

3. **Key Rotation**:
   - Rotate deployment keys periodically
   - Remove old/unused keys promptly
   - Keep track of key expiration dates

## Deployment Process

1. **Pre-deployment Checks**:
   ```bash
   # Test SSH connection
   ssh -i ~/.ssh/vps-deployment-key -o BatchMode=yes root@csmcl.space echo "SSH OK"
   
   # Check server status
   ssh csmcl.space "df -h && free -h && uptime"
   ```

2. **Backup Process**:
   ```bash
   # Create backup directory with timestamp
   ssh csmcl.space "mkdir -p /backups/\$(date +%Y%m%d_%H%M%S)"
   
   # Backup current deployment
   ssh csmcl.space "tar -czf /backups/\$(date +%Y%m%d_%H%M%S)/app_backup.tar.gz /var/www/csmcl.space"
   ```

3. **Deployment Commands**:
   ```bash
   # Deploy new version
   rsync -avz -e "ssh -i ~/.ssh/vps-deployment-key" ./dist/ root@csmcl.space:/var/www/csmcl.space/
   
   # Restart services
   ssh csmcl.space "systemctl restart nginx && systemctl restart app-name"
   ```

## Troubleshooting

### Common SSH Issues

1. **Permission Denied**:
   ```bash
   # Check key permissions
   chmod 600 ~/.ssh/vps-deployment-key
   chmod 644 ~/.ssh/vps-deployment-key.pub
   ```

2. **Connection Timeout**:
   - Verify server IP/domain is correct
   - Check if port 22 is open
   - Verify firewall rules

3. **Key Not Working**:
   ```bash
   # Test with verbose output
   ssh -v -i ~/.ssh/vps-deployment-key root@csmcl.space
   ```

### Server Health Checks

```bash
# Check disk space
ssh csmcl.space "df -h"

# Check memory usage
ssh csmcl.space "free -h"

# Check running services
ssh csmcl.space "systemctl status nginx mongodb app-name"

# View logs
ssh csmcl.space "tail -f /var/log/nginx/error.log"
```

## Emergency Procedures

1. **Server Unresponsive**:
   - Contact hosting provider
   - Check server status in provider's dashboard
   - Attempt hardware reset if necessary

2. **Rollback Process**:
   ```bash
   # List available backups
   ssh csmcl.space "ls -l /backups"
   
   # Restore from backup
   ssh csmcl.space "cd /var/www && tar -xzf /backups/[BACKUP_DATE]/app_backup.tar.gz"
   ```

## Monitoring

- Server monitoring: Set up with provider's tools
- Application monitoring: Custom dashboard
- Log monitoring: Centralized logging system
- Uptime monitoring: External service

## Contact Information

- **Server Provider**: [Provider Name]
- **Domain Registrar**: [Registrar Name]
- **Emergency Contact**: [Contact Information]

Remember to keep this documentation updated with any changes to the deployment process or server configuration.
