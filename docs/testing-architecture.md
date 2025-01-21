# Testing Architecture

## User Public Folders Testing

### Local Development
1. **Local Storage Structure**:
   ```
   /home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas/storage/
   ├── dev/
   │   └── public/
   │       └── users/
   │           └── {csmclName}/
   │               ├── public/
   │               └── private/
   ```

2. **Environment Variables**:
   ```env
   # .env.development
   STORAGE_ROOT=/home/nsbasicus/CascadeProjects/StarterTemplateDesignIdeas/storage/dev
   PUBLIC_URL=http://localhost:3000/storage
   ```

### Production
1. **VPS Storage Structure**:
   ```
   /var/www/csmcl.space/
   ├── storage/
   │   └── public/
   │       └── users/
   │           └── {csmclName}/
   │               ├── public/
   │               └── private/
   ```

2. **Environment Variables**:
   ```env
   # .env.production
   STORAGE_ROOT=/var/www/csmcl.space/storage
   PUBLIC_URL=https://csmcl.space/storage
   ```

## Email Account Testing

### Development Environment
1. **Test Email Domain**:
   - Use `dev.cosmical.me` for development testing
   - Each user gets: `{csmclName}@dev.cosmical.me`

2. **Mail Server Configuration**:
   ```env
   # .env.development
   MAIL_DOMAIN=dev.cosmical.me
   MAIL_API_ENDPOINT=https://mail.cosmical.me/api/dev
   MAIL_ADMIN_USER=admin@cosmical.me
   MAIL_ADMIN_PASSWORD=your_admin_password
   ```

### Production Environment
1. **Production Email Domain**:
   - Use `cosmical.me` for production
   - Each user gets: `{csmclName}@cosmical.me`

2. **Mail Server Configuration**:
   ```env
   # .env.production
   MAIL_DOMAIN=cosmical.me
   MAIL_API_ENDPOINT=https://mail.cosmical.me/api
   MAIL_ADMIN_USER=admin@cosmical.me
   MAIL_ADMIN_PASSWORD=your_admin_password
   ```

## Testing Workflow

### User Registration Testing
1. **Local Development**:
   ```javascript
   // Test user registration
   const testUser = {
     displayName: "Test User",
     csmclName: "testuser",
     regularEmail: "external@example.com",
     password: "TestPass123!"
   };
   ```

   This will:
   - Create local storage folders
   - Create test email account on `dev.cosmical.me`
   - Send verification email from `noreply@cosmical.me`

2. **Verification**:
   - Check local storage structure
   - Verify test email account creation
   - Test email forwarding

### Implementation Requirements

1. **Storage Service**:
   ```javascript
   class StorageService {
     async createUserFolders(csmclName) {
       const userRoot = path.join(process.env.STORAGE_ROOT, 'public/users', csmclName);
       await fs.promises.mkdir(path.join(userRoot, 'public'), { recursive: true });
       await fs.promises.mkdir(path.join(userRoot, 'private'), { recursive: true });
     }
   }
   ```

2. **Email Service**:
   ```javascript
   class EmailService {
     async createUserEmail(csmclName) {
       const domain = process.env.MAIL_DOMAIN;
       const email = `${csmclName}@${domain}`;
       
       // Create email account via mail server API
       await this.mailServerAPI.createAccount({
         username: csmclName,
         domain: domain,
         password: generateSecurePassword()
       });
     }
   }
   ```

3. **Integration Tests**:
   ```javascript
   describe('User Registration', () => {
     it('should create user folders and email account', async () => {
       const user = await registerUser(testUser);
       
       // Check folders
       const publicFolder = path.join(process.env.STORAGE_ROOT, 'public/users', user.csmclName, 'public');
       expect(await fs.promises.access(publicFolder)).toBeTruthy();
       
       // Check email account
       const emailExists = await emailService.checkAccount(`${user.csmclName}@${process.env.MAIL_DOMAIN}`);
       expect(emailExists).toBeTruthy();
     });
   });
   ```

## Security Considerations

1. **Development Environment**:
   - Use separate storage paths
   - Use development subdomain for emails
   - Implement proper cleanup after testing
   - Never use production credentials

2. **Production Environment**:
   - Implement proper permissions
   - Use SSL for all communications
   - Implement backup procedures
   - Monitor disk space and quotas
