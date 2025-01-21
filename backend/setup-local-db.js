db = db.getSiblingDB('admin');

// Create the development user if it doesn't exist
db.createUser({
  user: "cosmicnexus",
  pwd: "CosmicNexus2025!",
  roles: [
    { role: "readWrite", db: "cosmic-nexus-dev" },
    { role: "dbAdmin", db: "cosmic-nexus-dev" }
  ]
});
