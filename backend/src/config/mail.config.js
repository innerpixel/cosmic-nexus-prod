export const mailConfig = {
  // SMTP Configuration
  smtp: {
    host: process.env.MAIL_HOST || (process.env.NODE_ENV === 'development' ? 'smtp.ethereal.email' : 'mail.cosmical.me'),
    port: parseInt(process.env.MAIL_PORT) || (process.env.NODE_ENV === 'development' ? 587 : 25),
    secure: process.env.MAIL_SECURE === 'true',
    auth: process.env.NODE_ENV === 'development' ? {
      user: 'your.ethereal.email@ethereal.email',  // We'll get these credentials in a moment
      pass: 'your.ethereal.password'
    } : {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS || process.env.MAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  },

  // Mail domain configuration
  domain: process.env.MAIL_DOMAIN || (process.env.NODE_ENV === 'development' ? 'ethereal.email' : 'cosmical.me'),
  
  // Development settings
  development: {
    prefix: process.env.DEV_PREFIX || 'dev-',
    quotaMB: parseInt(process.env.DEV_QUOTA_MB) || 100
  }
};

// Log configuration
const { host, port, secure } = mailConfig.smtp;
const mode = process.env.NODE_ENV || 'production';
console.log(`Email service running in ${mode} mode using ${host}:${port} (secure: ${secure})`);
