import nodemailer from 'nodemailer';

class EmailTester {
  constructor() {
    this.testAccount = null;
    this.transporter = null;
    this.previewUrls = new Map();
  }

  async initialize() {
    try {
      // Create Ethereal test account
      this.testAccount = await nodemailer.createTestAccount();
      
      // Create reusable transporter
      this.transporter = nodemailer.createTransport({
        host: this.testAccount.smtp.host,
        port: this.testAccount.smtp.port,
        secure: this.testAccount.smtp.secure,
        auth: {
          user: this.testAccount.user,
          pass: this.testAccount.pass
        }
      });
      
      console.log('\n📧 Email Testing Environment Ready!');
      console.log('----------------------------------------');
      console.log('View all emails at: https://ethereal.email/messages');
      console.log('Login credentials:');
      console.log('Email:', this.testAccount.user);
      console.log('Password:', this.testAccount.pass);
      console.log('----------------------------------------\n');

      return {
        host: this.testAccount.smtp.host,
        port: this.testAccount.smtp.port,
        user: this.testAccount.user,
        pass: this.testAccount.pass
      };
    } catch (error) {
      console.error('Failed to create test email account:', error);
      throw error;
    }
  }

  savePreviewUrl(messageId, url) {
    this.previewUrls.set(messageId, url);
  }

  async sendTestEmail(type) {
    if (!this.transporter) {
      throw new Error('Email tester not initialized. Call initialize() first.');
    }

    const templates = {
      welcome: {
        to: 'new.user@example.com',
        subject: 'Welcome to Cosmic Nexus!',
        text: 'Welcome to Cosmic Nexus! We are excited to have you on board.'
      },
      reset: {
        to: 'user@example.com',
        subject: 'Password Reset Request',
        text: 'Click the link below to reset your password: https://local.csmcl.space/reset-password'
      },
      verification: {
        to: 'user@example.com',
        subject: 'Verify Your Email',
        text: 'Please verify your email by clicking: https://local.csmcl.space/verify-email'
      }
    };

    const template = templates[type] || templates.welcome;
    
    try {
      const info = await this.transporter.sendMail({
        from: `Cosmic Nexus <${this.testAccount.user}>`,
        to: template.to,
        subject: template.subject,
        text: template.text
      });

      console.log(`✅ Test email '${type}' sent successfully!`);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      
      return info;
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      throw error;
    }
  }

  async runAllTests() {
    console.log('🧪 Running email tests...\n');
    
    const tests = ['welcome', 'reset', 'verification'];
    const results = [];

    for (const test of tests) {
      try {
        const result = await this.sendTestEmail(test);
        results.push({ type: test, success: true, messageId: result.messageId });
        console.log(`✅ ${test} email sent successfully`);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
        console.log('');
      } catch (error) {
        results.push({ type: test, success: false, error: error.message });
        console.log(`❌ ${test} email failed`);
        console.log('');
      }
    }

    console.log('\n📊 Email Test Results:');
    console.log('----------------------------------------');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.type}`);
    });
    console.log('----------------------------------------\n');

    return results;
  }
}

export default new EmailTester();
