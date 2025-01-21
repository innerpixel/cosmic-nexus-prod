import fs from 'fs/promises';
import path from 'path';

class StorageService {
  constructor() {
    // Get storage path from environment
    this.storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage', 'dev');
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      // Create base storage directories if they don't exist
      await fs.mkdir(path.join(this.storagePath, 'users'), { recursive: true });
      console.log('Storage initialized at:', this.storagePath);
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw new Error('Storage initialization failed');
    }
  }

  async createUserFolders(csmclName) {
    console.log(`Creating storage folders for user: ${csmclName}`);
    
    try {
      const userRoot = path.join(this.storagePath, 'users', csmclName);
      
      // Create user directories
      await fs.mkdir(path.join(userRoot, 'public'), { recursive: true });
      await fs.mkdir(path.join(userRoot, 'private'), { recursive: true });
      
      // Create subdirectories
      const directories = {
        public: ['photos', 'documents', 'shared'],
        private: ['backups', 'settings', 'mail']
      };

      for (const [type, folders] of Object.entries(directories)) {
        for (const folder of folders) {
          await fs.mkdir(path.join(userRoot, type, folder), { recursive: true });
        }
      }

      return userRoot;
    } catch (error) {
      console.error(`Failed to create user folders for ${csmclName}:`, error);
      throw error;
    }
  }

  async deleteUserFolders(csmclName) {
    console.log(`Deleting storage folders for user: ${csmclName}`);
    
    try {
      const userRoot = path.join(this.storagePath, 'users', csmclName);
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
