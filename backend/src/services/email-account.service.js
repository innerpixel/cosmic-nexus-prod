import nodemailer from 'nodemailer';
import userSystemService from './user-system.service.js';

class EmailAccountService {
  constructor() {
    this.initialized = false;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      // In development, use direct Maildir delivery
      if (this.isDevelopment) {
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix'
        });
      } else {
        // In production, use SMTP
        this.transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: parseInt(process.env.MAIL_PORT),
          secure: process.env.MAIL_SECURE === 'true',
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
          }
        });
      }
      
      // Verify connection
      await this.transporter.verify();
      console.log('Mail server connection verified');
      this.initialized = true;
      
      // Log mail configuration
      console.log('Initializing email configuration with:', {
        mode: this.isDevelopment ? 'development (stream)' : 'production (smtp)',
        host: this.isDevelopment ? 'localhost' : process.env.MAIL_HOST,
        from: process.env.MAIL_FROM || 'noreply@local-dev.test'
      });
    } catch (error) {
      console.error('Email configuration error:', error);
      throw error;
    }
  }

  async checkEmailAccount(username) {
    return await userSystemService.checkSystemUser(username);
  }

  async createEmailAccount(username, password) {
    const result = await userSystemService.createSystemUser(username, password);
    if (result.status === 'pending') {
      console.log('Email account creation started:', result.message);
    }
    return result;
  }

  async deleteEmailAccount(username) {
    return await userSystemService.deleteSystemUser(username);
  }

  async sendVerificationEmail(user, verificationToken) {
    try {
      await this.ensureInitialized();
      
      const message = {
        from: `CSMCL <${process.env.MAIL_FROM || 'noreply@local-dev.test'}>`,
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

      console.log('Attempting to send verification email:', {
        to: message.to,
        from: message.from,
        subject: message.subject
      });

      const info = await this.transporter.sendMail(message);
      
      // In development, write to Maildir directly
      if (this.isDevelopment && info.message) {
        const fs = await import('fs/promises');
        const path = await import('path');
        const crypto = await import('crypto');
        const { execSync } = await import('child_process');
        
        const username = user.regularEmail.split('@')[0];
        const maildir = `/home/${username}/Maildir/new`;
        const timestamp = Math.floor(Date.now() / 1000);
        const random = crypto.randomBytes(8).toString('hex');
        const filename = `${timestamp}.${random}.localhost.localdomain`;
        const filepath = path.join(maildir, filename);
        
        await fs.writeFile(filepath, info.message);
        execSync(`sudo -A chown ${username}:mail ${filepath}`, { env: { SUDO_ASKPASS: './backend/scripts/sudo-askpass.sh' } });
        execSync(`sudo -A chmod 660 ${filepath}`, { env: { SUDO_ASKPASS: './backend/scripts/sudo-askpass.sh' } });
        console.log('Email written to Maildir:', filepath);
      } else {
        console.log('Verification email sent:', {
          messageId: info.messageId,
          response: info.response,
          envelope: info.envelope
        });
      }
      
      console.log('Verification token:', verificationToken);  // Log the token for easy testing

      return true;
    } catch (error) {
      console.error('Error sending verification email:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        command: error.command
      });
      throw error;
    }
  }

  async sendWelcomeEmail(to, name) {
    const mailOptions = {
      from: process.env.MAIL_FROM || `noreply@${process.env.MAIL_HOST}`,
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
