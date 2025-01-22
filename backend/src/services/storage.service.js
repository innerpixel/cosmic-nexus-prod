import { promises as fs } from 'fs';
import path from 'path';

class StorageService {
  constructor() {
    this.baseStoragePath = '/home/storage/users';
  }

  async initializeStorage() {
    try {
      // We don't need to create the base storage path anymore
      // It's managed by the system user creation
      return true;
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw new Error('Storage initialization failed');
    }
  }

  getUserStoragePath(username) {
    return path.join(this.baseStoragePath, username);
  }

  async ensureUserStorage(username) {
    // We don't need this anymore as the system creates the directory
    return true;
  }

  async getUserStorageInfo(username) {
    try {
      const userPath = this.getUserStoragePath(username);
      const stats = await fs.stat(userPath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { exists: false };
      }
      throw error;
    }
  }

  async listUserFiles(username) {
    try {
      const userPath = this.getUserStoragePath(username);
      const files = await fs.readdir(userPath);
      return files;
    } catch (error) {
      console.error(`Failed to list files for user ${username}:`, error);
      throw error;
    }
  }

  async deleteUserStorage(username) {
    // We don't need this anymore as userdel -r handles cleanup
    return true;
  }
}

export default new StorageService();
