import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class LinuxUserService {
  async createUser(username, password) {
    try {
      // Create user with home directory
      await execAsync(`sudo useradd -m -s /bin/bash ${username}`);
      
      // Set user password
      await execAsync(`echo "${username}:${password}" | sudo chpasswd`);
      
      // Create public_html directory in user's home
      await execAsync(`sudo -u ${username} mkdir -p /home/${username}/public_html`);
      
      // Set proper permissions
      await execAsync(`sudo chmod 711 /home/${username}`);
      await execAsync(`sudo chmod 755 /home/${username}/public_html`);
      
      return true;
    } catch (error) {
      console.error('Failed to create Linux user:', error);
      throw new Error('Failed to create Linux user');
    }
  }

  async deleteUser(username) {
    try {
      // Remove user and their home directory
      await execAsync(`sudo userdel -r ${username}`);
      return true;
    } catch (error) {
      console.error('Failed to delete Linux user:', error);
      throw new Error('Failed to delete Linux user');
    }
  }

  async userExists(username) {
    try {
      await execAsync(`id ${username}`);
      return true;
    } catch {
      return false;
    }
  }
}

export default new LinuxUserService();
