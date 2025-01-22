import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';

const execAsync = promisify(exec);

class UserSystemService {
  constructor() {
    this.userGroup = 'csmcl';
    this.defaultShell = '/bin/bash';
    this.askpassPath = path.join(process.cwd(), 'scripts', 'sudo-askpass.sh');
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  async execSudo(command) {
    const env = {
      ...process.env,
      SUDO_ASKPASS: this.askpassPath
    };
    return execAsync(`sudo -A ${command}`, { env });
  }

  async createSystemUser(username, password) {
    try {
      console.log(`Creating system user: ${username}`);
      
      // Create user with askpass
      await this.execSudo(`/usr/sbin/useradd -m -g ${this.userGroup} -s ${this.defaultShell} ${username}`);
      console.log('User created, setting password...');
      
      // Set password
      await execAsync(`echo "${username}:${password}" | sudo -A /usr/bin/chpasswd`, { 
        env: { SUDO_ASKPASS: this.askpassPath } 
      });
      console.log('Password set successfully...');
      
      // Create mail directory structure in user's home
      await this.execSudo(`mkdir -p /home/${username}/Maildir/{new,cur,tmp}`);
      await this.execSudo(`/usr/sbin/usermod -g ${this.userGroup} ${username}`);
      await this.execSudo(`chown -R ${username}:${this.userGroup} /home/${username}/Maildir`);
      await this.execSudo(`chmod -R 700 /home/${username}/Maildir`);
      
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
      
      // Remove user and their home directory with askpass
      await this.execSudo(`/usr/sbin/userdel -r ${username}`);
      
      // Clean up any remaining files
      if (await this.fileExists(`/var/spool/mail/${username}`)) {
        await this.execSudo(`rm -rf /var/spool/mail/${username}`);
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
      await this.execSudo(`setquota -u ${username} 0 ${quotaMB}M 0 0 /home`);
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
