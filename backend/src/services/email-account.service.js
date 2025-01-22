import nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';

class EmailAccountService {
  constructor() {
    this.initialized = false;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.transporter = null;
  }

  async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      if (this.isDevelopment) {
        // In development, create an Ethereal test account
        const testAccount = await nodemailer.createTestAccount();
        console.log('Created Ethereal test account:', testAccount.user);
        
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        
        console.log('Development mail transport initialized (using Ethereal)');
        this.initialized = true;
        return;
      }
      
      // Production: Create transporter with config
      this.transporter = nodemailer.createTransport(mailConfig.smtp);
      
      // Verify connection
      await this.transporter.verify();
      console.log('Mail server connection verified');
      this.initialized = true;
      
      // Log mail configuration
      console.log('Initializing email configuration with:', {
        host: mailConfig.smtp.host,
        port: mailConfig.smtp.port,
        from: process.env.MAIL_FROM
      });
    } catch (error) {
      console.error('Email configuration error:', error);
      throw error;
    }
  }

  async checkEmailAccount(username) {
    try {
      if (this.isDevelopment) {
        // In development, check if local Unix user exists
        const { exec } = await import('child_process');
        const util = await import('util');
        const execAsync = util.promisify(exec);

        try {
          await execAsync(`id ${username}`);
          return true; // User exists
        } catch (error) {
          return false; // User doesn't exist
        }
      }

      // In production, check if email account exists on mail server
      const email = `${username}@${mailConfig.domain}`;
      
      // Add your production mail server account check logic here
      // This might involve API calls to your mail server or other methods
      
      return false;
    } catch (error) {
      console.error('Error checking email account:', error);
      throw error;
    }
  }

  async createEmailAccount(username, password) {
    try {
      if (this.isDevelopment) {
        // In development, create a local Unix user
        const { exec } = await import('child_process');
        const util = await import('util');
        const execAsync = util.promisify(exec);

        try {
          // Create user with home directory
          await execAsync(`sudo useradd -m -s /bin/bash ${username}`);
          
          // Set user password (using chpasswd)
          await execAsync(`echo "${username}:${password}" | sudo chpasswd`);
          
          console.log(`Local Unix user ${username} created successfully`);
          return true;
        } catch (error) {
          console.error('Error creating local Unix user:', error);
          return false;
        }
      }

      // In production, create email account on mail server
      const email = `${username}@${mailConfig.domain}`;
      
      // Add your production mail server account creation logic here
      // This might involve API calls to your mail server or other methods
      
      return true;
    } catch (error) {
      console.error('Error creating email account:', error);
      throw error;
    }
  }

  async deleteEmailAccount(username) {
    try {
      if (this.isDevelopment) {
        // In development, delete local Unix user
        const { exec } = await import('child_process');
        const util = await import('util');
        const execAsync = util.promisify(exec);

        try {
          await execAsync(`sudo userdel -r ${username}`);
          console.log(`Local Unix user ${username} deleted successfully`);
          return true;
        } catch (error) {
          console.error('Error deleting local Unix user:', error);
          return false;
        }
      }

      // In production, delete email account on mail server
      const email = `${username}@${mailConfig.domain}`;
      
      // Add your production mail server account deletion logic here
      // This might involve API calls to your mail server or other methods
      
      return true;
    } catch (error) {
      console.error('Error deleting email account:', error);
      throw error;
    }
  }

  async sendVerificationEmail(user, verificationToken) {
    try {
      await this.ensureInitialized();
      
      const message = {
        from: `CSMCL <${process.env.MAIL_FROM || 'noreply@local.test'}>`,
        to: user.regularEmail,
        subject: 'Verify your CSMCL account',
        text: `Hello ${user.displayName},\n\nYour email verification token is:\n\n${verificationToken}\n\nPlease enter this token in the verification form to verify your email address.\n\nIf you did not request this verification, please ignore this email.\n\nBest regards,\nCSMCL Team`,
        html: `
          <h2>Hello ${user.displayName},</h2>
          <p>Your email verification token is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 16px;">
            ${verificationToken}
          </div>
          <p>Please enter this token in the verification form to verify your email address.</p>
          <p>If you did not request this verification, please ignore this email.</p>
          <br>
          <p>Best regards,<br>CSMCL Team</p>
        `
      };

      const info = await this.transporter.sendMail(message);
      console.log('Verification email sent:', info.messageId);
      
      // If we're in development mode using Ethereal, log the preview URL
      if (this.isDevelopment) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('Preview URL:', previewUrl);
        console.log('Verification token:', verificationToken);  // Log the token for easy testing
      }

      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to, name) {
    const mailOptions = {
      from: process.env.MAIL_FROM || `noreply@${mailConfig.domain}`,
      to: to,
      subject: 'Welcome to Cosmic Nexus!',
      text: `Welcome ${name}! Your account has been created successfully.`
    };
    
    try {
      await this.ensureInitialized();
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }
}

export default new EmailAccountService();
