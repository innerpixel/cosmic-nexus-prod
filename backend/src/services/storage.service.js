import fs from 'fs/promises';
import path from 'path';

class StorageService {
  constructor() {
    // Get storage root from environment
    this.storageRoot = process.env.STORAGE_ROOT || path.join(process.cwd(), 'storage', 'dev');
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      // Create base storage directories if they don't exist
      await fs.mkdir(path.join(this.storageRoot, 'users'), { recursive: true });
      console.log('Storage initialized at:', this.storageRoot);
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw new Error('Storage initialization failed');
    }
  }

  async createUserFolders(csmclName) {
    console.log(`Creating storage folders for user: ${csmclName}`);
    
    try {
      const userRoot = path.join(this.storageRoot, 'users', csmclName);
      
      // Create public and private directories
      await fs.mkdir(path.join(userRoot, 'public'), { recursive: true });
      await fs.mkdir(path.join(userRoot, 'private'), { recursive: true });
      
      // Set proper permissions (readable by web server)
      await fs.chmod(path.join(userRoot, 'public'), 0o755);
      await fs.chmod(path.join(userRoot, 'private'), 0o700);
      
      console.log(`Storage folders created for ${csmclName}`);
      return true;
    } catch (error) {
      console.error(`Failed to create storage for user ${csmclName}:`, error);
      throw new Error('Failed to create user storage');
    }
  }

  async deleteUserFolders(csmclName) {
    console.log(`Deleting storage folders for user: ${csmclName}`);
    
    try {
      const userRoot = path.join(this.storageRoot, 'users', csmclName);
      await fs.rm(userRoot, { recursive: true, force: true });
      console.log(`Storage folders deleted for ${csmclName}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete storage for user ${csmclName}:`, error);
      throw new Error('Failed to delete user storage');
    }
  }
}

export default new StorageService();
