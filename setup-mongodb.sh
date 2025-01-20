#!/bin/bash

# Backup the original config
cp /etc/mongod.conf /etc/mongod.conf.backup

# Update MongoDB configuration to allow remote connections
sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf

# Restart MongoDB
systemctl restart mongod

# Create the database and user
mongosh admin --eval '
  db.createUser({
    user: "cosmicnexus",
    pwd: "CosmicNexus2025!",
    roles: [
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" }
    ]
  });
'

# Configure firewall
ufw allow 27017/tcp
ufw reload

echo "MongoDB setup completed!"
