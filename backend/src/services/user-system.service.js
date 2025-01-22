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
      
      // Execute commands separately to match our NOPASSWD sudoers entries
      await execAsync(`sudo /usr/sbin/useradd -m -g ${this.userGroup} -s ${this.defaultShell} ${username}`);
      console.log('User created, setting password...');
      
      await execAsync(`echo "${username}:${password}" | sudo /usr/bin/chpasswd`);
      console.log('Password set successfully...');
      
      // Create mail directory structure in user's home
      await execAsync(`sudo mkdir -p /home/${username}/Maildir/{new,cur,tmp}`);
      await execAsync(`sudo /usr/sbin/usermod -g ${this.userGroup} ${username}`);
      await execAsync(`sudo chown -R ${username}:${this.userGroup} /home/${username}/Maildir`);
      await execAsync(`sudo chmod -R 700 /home/${username}/Maildir`);
      
      // Set quota only in production
      if (!this.isDevelopment) {
        await this.setUserQuota(username, 100);
      }
      
      console.log(`System user ${username} created successfully`);
      return true;
    } catch (error) {
      console.error('Failed to create system user:', error);
      throw new Error(`Failed to create system user: ${error.message}`);
    }
  }

  async deleteSystemUser(username) {
    try {
      console.log(`Deleting system user: ${username}`);
      
      // Remove user and their home directory using NOPASSWD command
      await execAsync(`sudo /usr/sbin/userdel -r ${username}`);
      
      // Clean up any remaining files
      if (await this.fileExists(`/var/spool/mail/${username}`)) {
        await execAsync(`sudo rm -rf /var/spool/mail/${username}`);
      }
      
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

  async fileExists(path) {
    try {
      await execAsync(`test -f ${path}`);
      return true;
    } catch {
      return false;
    }
  }
}

export default new UserSystemService();
