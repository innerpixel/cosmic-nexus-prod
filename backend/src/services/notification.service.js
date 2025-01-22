import emailAccountService from './email-account.service.js';

class NotificationService {
  constructor() {
    this.emailService = emailAccountService;
  }

  async sendVerificationEmail({ to, token }) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    try {
      await this.emailService.ensureInitialized();
      const info = await this.emailService.sendVerificationEmail(to, token);
      console.log('Verification email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail({ to, name }) {
    try {
      await this.emailService.ensureInitialized();
      const info = await this.emailService.sendWelcomeEmail(to, name);
      console.log('Welcome email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail({ to, token }) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: to,
      subject: 'Reset Your Password - Cosmic Nexus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You have requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4F46E5; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    };

    try {
      await this.emailService.ensureInitialized();
      const info = await this.emailService.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendPhoneVerificationSMS({ to, code }) {
    // TODO: Implement SMS sending
    console.log('TODO: Send phone verification SMS to', to, 'with code:', code);
  }
}

export default new NotificationService();
