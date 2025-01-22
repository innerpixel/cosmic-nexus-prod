import { promises as fs } from 'fs';
import path from 'path';

class StorageService {
  constructor() {
    this.baseStoragePath = '/home';
  }

  async initializeStorage() {
    // No initialization needed, system manages directories
    return true;
  }

  getUserStoragePath(username) {
    return path.join(this.baseStoragePath, username);
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
}

export default new StorageService();
