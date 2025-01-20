# Testing Guide

## Overview
This project uses Vitest as the testing framework, which is optimized for Vite-based projects. Our tests follow the AAA pattern (Arrange, Act, Assert) and use isolation techniques to ensure reliable test results.

## Test Structure

### Authentication Tests (`tests/auth.test.js`)

The authentication tests verify the core functionality of our user authentication system:

#### 1. User Registration
- **Success Case**: Verifies that users can register with valid credentials
- **Validation Cases**: Tests input validation for:
  - Required fields
  - Terms acceptance
  - Email uniqueness

#### 2. Email Verification
- **Success Case**: Confirms that users can verify their email with a valid token
- **Failure Cases**: Tests:
  - Invalid tokens
  - Expired tokens
  - Missing tokens

#### 3. User Login
- **Success Case**: Verifies that verified users can login with correct credentials
- **Failure Cases**: Tests:
  - Unverified users
  - Invalid credentials
  - Non-existent users

## Testing Tools and Techniques

### 1. Mocking
We use Vitest's mocking capabilities to isolate our tests from external dependencies:
```javascript
vi.mock('../src/services/notification.service.js', () => ({
  default: {
    sendVerificationEmail: vi.fn(),
    sendSmsVerification: vi.fn()
  }
}));
```

### 2. Database Cleanup
Each test starts with a clean database state:
```javascript
beforeEach(async () => {
  await User.deleteMany({});
});
```

### 3. Test Data
We use consistent test data objects to maintain reliability:
```javascript
const validUser = {
  email: 'test@example.com',
  password: 'ValidPass123!',
  displayName: 'Test User',
  terms: true,
  isTest: true
};
```

### 4. HTTP Testing
We use SuperTest to simulate HTTP requests:
```javascript
const res = await request(app)
  .post('/api/auth/login')
  .send(credentials);
```

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on the state from other tests
2. **Clear Naming**: Test descriptions clearly state what is being tested
3. **Single Purpose**: Each test verifies one specific behavior
4. **Proper Setup**: Use `beforeEach` to set up test conditions
5. **Clean Teardown**: Clean up any test data after tests complete

## Running Tests

### All Tests
```bash
npm run test:all
```

### Backend Tests Only
```bash
cd server && npm run test
```

### Watch Mode
```bash
npm run test:watch
```

## Writing New Tests

1. Create a new test file in the appropriate directory
2. Import required dependencies and modules
3. Set up any necessary mocks
4. Write your tests following the AAA pattern:
   ```javascript
   describe('Feature', () => {
     it('should behave in a certain way', async () => {
       // Arrange
       const testData = {...};
       
       // Act
       const result = await someFunction(testData);
       
       // Assert
       expect(result).toBe(expectedValue);
     });
   });
   ```

## Common Testing Patterns

### Testing Error Cases
```javascript
it('should handle errors appropriately', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ /* invalid data */ });
    
  expect(res.status).toBe(400);
  expect(res.body.message).toContain('error message');
});
```

### Testing Success Cases
```javascript
it('should complete successfully', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send(validUser);
    
  expect(res.status).toBe(201);
  expect(res.body.data).toHaveProperty('user');
});
```

## Debugging Tests

1. Use console.log() for temporary debugging
2. Check the test output for detailed error messages
3. Use the `--inspect` flag with Node.js debugger
4. Review the test setup and teardown process

## Test Coverage
We aim for high test coverage but prioritize testing critical paths and edge cases over raw coverage numbers. Key areas that must be tested:

1. Authentication flows
2. Data validation
3. Error handling
4. Security features

Remember: Good tests are readable, maintainable, and reliable. They serve as documentation and catch regressions early.
