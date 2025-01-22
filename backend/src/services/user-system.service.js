import { promisify } from 'util';
import { exec } from 'child_process';
const execAsync = promisify(exec);

class UserSystemService {
  constructor() {
    this.defaultShell = '/bin/bash';
    this.userGroup = 'csmcl';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  async createSystemUser(username, password) {
    try {
      console.log(`Creating system user: ${username}`);

      // Create user with home directory and specific shell
      await execAsync(`sudo useradd -m -g ${this.userGroup} -s ${this.defaultShell} ${username}`);
      
      // Set user password
      await execAsync(`echo "${username}:${password}" | sudo chpasswd`);
      
      // Create mail directory structure
      await execAsync(`sudo mkdir -p /home/${username}/Maildir/{new,cur,tmp}`);
      await execAsync(`sudo chown -R ${username}:${this.userGroup} /home/${username}/Maildir`);
      await execAsync(`sudo chmod -R 700 /home/${username}/Maildir`);
      
      // Set quota only in production
      if (!this.isDevelopment) {
        await this.setUserQuota(username, 100);
      }
      
      // Create storage directories
      const dirs = [
        'public/photos',
        'public/documents',
        'public/shared',
        'private/backups',
        'private/settings',
        'private/mail'
      ];
      
      for (const dir of dirs) {
        await execAsync(`sudo mkdir -p /home/${username}/${dir}`);
      }
      
      // Set proper ownership and permissions
      await execAsync(`sudo chown -R ${username}:${this.userGroup} /home/${username}`);
      await execAsync(`sudo chmod -R 750 /home/${username}`);
      
      console.log(`System user ${username} created successfully`);
      return true;
    } catch (error) {
      console.error('Error creating system user:', error);
      throw error;
    }
  }

  async deleteSystemUser(username) {
    try {
      console.log(`Deleting system user: ${username}`);
      
      // Remove user and their home directory
      await execAsync(`sudo userdel -r ${username}`);
      
      // Clean up any remaining files
      await execAsync(`sudo rm -rf /var/spool/mail/${username}`);
      
      console.log(`System user ${username} deleted successfully`);
      return true;
    } catch (error) {
      if (error.message.includes('user does not exist')) {
        console.warn(`User ${username} does not exist in system, skipping deletion`);
        return true;
      }
      console.error('Failed to delete system user:', error);
      throw new Error(`Failed to delete system user: ${error.message}`);
    }
  }

  async checkSystemUser(username) {
    try {
      await execAsync(`id ${username}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async setUserQuota(username, quotaMB) {
    if (this.isDevelopment) {
      console.log('Skipping quota setup in development mode');
      return true;
    }
    
    try {
      await execAsync(`sudo setquota -u ${username} 0 ${quotaMB}M 0 0 /home`);
      return true;
    } catch (error) {
      console.error('Error setting user quota:', error);
      throw error;
    }
  }
}

export default new UserSystemService();
