export const mailConfig = {
  // SMTP Configuration for cosmical.me (mail server)
  smtp: {
    host: process.env.MAIL_HOST,  // Uses dev.cosmical.me or cosmical.me based on environment
    port: parseInt(process.env.MAIL_PORT) || 587,
    secure: false,             // Use STARTTLS
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  },

  // Account Management API
  api: {
    endpoint: process.env.MAIL_API_ENDPOINT,
    adminUser: process.env.MAIL_ADMIN_USER,
    adminPassword: process.env.MAIL_ADMIN_PASSWORD
  },

  // Mail domain configuration
  domain: process.env.MAIL_DOMAIN || 'cosmical.me',
  
  // Development settings
  development: {
    prefix: process.env.DEV_PREFIX || 'dev-',
    quotaMB: parseInt(process.env.DEV_QUOTA_MB) || 100,
    // In development, we'll use ethereal.email for testing
    useTestAccount: process.env.NODE_ENV === 'development'
  }
};

// Override SMTP settings in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode: Mail server will use ethereal.email for testing');
}
