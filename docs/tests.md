# Authentication Testing Documentation

This document provides a comprehensive overview of our authentication system tests. We use Vitest as our testing framework and follow a combination of unit testing and integration testing approaches.

## Test Structure

Our tests are organized into three main files:

1. `auth.test.js`: Integration tests for API endpoints
2. `auth.service.test.js`: Unit tests for authentication services
3. `user.model.test.js`: Unit tests for user model validation

### Test Categories

#### 1. User Model Tests (`user.model.test.js`)

These tests focus on the User model's validation rules and password handling:

- **Validation Tests**
  - Email format validation
  - Password strength requirements
  - Display name format and length
  - Terms acceptance requirement
  - Test user exceptions (allowing simpler passwords)

- **Password Hashing**
  - Automatic password hashing before save
  - Password comparison functionality
  - Salt uniqueness for each user

- **Email Verification**
  - Initial verification status
  - Verification token storage
  - Token expiration handling

#### 2. Authentication Service Tests (`auth.service.test.js`)

These tests verify the token generation and validation functionality:

- **Token Generation**
  - Access token creation
  - Refresh token creation
  - Token payload structure
  - Token expiration times (15 minutes for access, 7 days for refresh)

- **Token Verification**
  - Valid token verification
  - Expired token rejection
  - Invalid token handling
  - Token payload integrity

#### 3. API Integration Tests (`auth.test.js`)

These tests ensure the entire authentication flow works correctly:

- **Registration (`/api/auth/register`)**
  - Successful user registration
  - Terms acceptance validation
  - Duplicate email prevention
  - Invalid data handling
  - Test user registration exceptions

- **Login (`/api/auth/login`)**
  - Successful login with valid credentials
  - Invalid password handling
  - Unverified user restrictions
  - Token generation and response structure

- **Email Verification (`/api/auth/verify-email`)**
  - Successful email verification
  - Invalid token handling
  - Token expiration
  - User status updates

## Unit Testing vs Integration Testing

### Unit Testing
Unit tests focus on testing individual components (units) in isolation. They verify that each piece of code works correctly on its own.

In our codebase, `user.model.test.js` and `auth.service.test.js` are unit tests because they test specific components in isolation:

```javascript
// Example from user.model.test.js - Unit Test
it('should hash password before saving', async () => {
  const user = new User({
    email: 'test@example.com',
    password: 'ValidPass123!',
    displayName: 'Test User',
    termsAccepted: true,
    isTest: true
  });

  await user.save();
  // Test single unit of functionality: password hashing
  expect(user.password).not.toBe('ValidPass123!');
  expect(user.password).toMatch(/^\$2[aby]\$\d+\$/);
});
```

Key characteristics of unit tests:
- Test one thing at a time
- Don't rely on external services
- Fast execution
- Easy to pinpoint failures
- Mock external dependencies

### Integration Testing
Integration tests verify that different components work together correctly. They test the interaction between components and external services.

In our codebase, `auth.test.js` contains integration tests because it tests the entire authentication flow:

```javascript
// Example from auth.test.js - Integration Test
it('should login verified user with correct credentials', async () => {
  // Step 1: Register a user (tests user creation)
  await request(app)
    .post('/api/auth/register')
    .send(validUser);

  // Step 2: Get and verify the user (tests database interaction)
  const user = await User.findOne({ email: validUser.email });
  user.isEmailVerified = true;
  await user.save();

  // Step 3: Attempt login (tests authentication flow)
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: validUser.email,
      password: validUser.password
    });

  // Step 4: Verify response (tests entire system response)
  expect(res.status).toBe(200);
  expect(res.body.data.accessToken).toBeDefined();
  expect(res.body.data.user.email).toBe(validUser.email);
});
```

Key characteristics of integration tests:
- Test multiple components together
- Test external service interactions
- Slower execution
- More complex setup
- Real dependencies (database, services)

### When to Use Each Type

**Use Unit Tests When:**
- Testing individual functions or methods
- Testing business logic
- Testing data validation
- Need fast test execution
- Want to isolate bugs quickly

Example from our codebase:
```javascript
// Unit test for token generation
it('should generate tokens with correct expiration', async () => {
  const { accessToken, refreshToken } = generateTokens(userId);
  const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
  expect(decodedAccess.exp - decodedAccess.iat).toBe(15 * 60); // 15 minutes
});
```

**Use Integration Tests When:**
- Testing API endpoints
- Testing database operations
- Testing authentication flows
- Testing service interactions
- Verifying system behavior

Example from our codebase:
```javascript
// Integration test for registration flow
it('should not register user without terms acceptance', async () => {
  const userWithoutTerms = { ...validUser, termsAccepted: false };
  const res = await request(app)
    .post('/api/auth/register')
    .send(userWithoutTerms);

  expect(res.status).toBe(400);
  expect(res.body.message).toBe('You must accept the Terms of Service and Privacy Policy to register');
});
```

### Testing Pyramid
Our testing strategy follows the testing pyramid principle:
```
     /\
    /  \     E2E Tests (Few)
   /----\    Integration Tests (Some)
  /------\   Unit Tests (Many)
 /--------\  
```

- Many unit tests for core functionality
- Fewer integration tests for component interactions
- Few end-to-end tests for critical paths

This approach provides:
- Fast feedback during development
- Good test coverage
- Balance between testing speed and confidence
- Easy maintenance of test suite

## Test Implementation Details

### 1. Security Considerations

- **Password Hashing**: We test that passwords are never stored in plain text
- **Token Security**: Verify that tokens contain necessary claims and proper expiration
- **Access Control**: Ensure proper status codes (401 vs 403) for different scenarios

### 2. Data Validation

- **Input Validation**: Test all input fields with both valid and invalid data
- **Error Messages**: Verify helpful error messages for each validation failure
- **Edge Cases**: Test boundary conditions for fields like display name length

### 3. Test Data Management

- **Database Cleanup**: Each test suite cleans the database before running
- **Test User Flag**: Special handling for test users with relaxed validation
- **Mock Services**: Email notifications are mocked for testing

## Running the Tests

```bash
npm test
```

This will run all 27 tests across the three test files. The tests are designed to be:
- Independent: Each test can run in isolation
- Repeatable: Same results on every run
- Fast: Most tests complete in under 4 seconds
- Clear: Test names describe the exact functionality being tested

## Best Practices Implemented

1. **Isolation**: Each test runs with a clean database state
2. **Descriptive Names**: Test names clearly indicate what's being tested
3. **Proper Assertions**: Using specific assertions for each check
4. **Error Handling**: Testing both success and failure scenarios
5. **Mock Services**: External services are properly mocked

## Common Test Scenarios

### Registration Flow
```javascript
// Example test structure
it('should register a new user successfully', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send(validUser);

  expect(res.status).toBe(201);
  expect(res.body.data.user.email).toBe(validUser.email);
  // ... additional assertions
});
```

### Login Flow
```javascript
// Example test structure
it('should login verified user with correct credentials', async () => {
  // Setup: Register and verify user
  // Test: Attempt login
  // Assert: Check response and tokens
});
```

## Maintenance and Updates

When adding new features to the authentication system:

1. Add corresponding test cases
2. Update existing tests if behavior changes
3. Run the full test suite to check for regressions
4. Document new test cases in this file

## Future Improvements

- Add performance tests for token generation
- Implement rate limiting tests
- Add stress tests for concurrent authentication requests
- Expand test coverage for password reset flow
