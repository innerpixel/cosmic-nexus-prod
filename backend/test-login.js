import axios from 'axios';

const testInvalidLogin = async () => {
  try {
    // Test case 1: Wrong password
    console.log('\nTest 1: Wrong password');
    try {
      await axios.post('http://local-dev.test:5000/api/auth/login', {
        email: 'nova@local-dev.test',
        password: 'WrongPassword123!'
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    // Test case 2: Non-existent email
    console.log('\nTest 2: Non-existent email');
    try {
      await axios.post('http://local-dev.test:5000/api/auth/login', {
        email: 'nonexistent@local-dev.test',
        password: 'Password123!'
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    // Test case 3: Invalid email format
    console.log('\nTest 3: Invalid email format');
    try {
      await axios.post('http://local-dev.test:5000/api/auth/login', {
        email: 'invalid-email',
        password: 'Password123!'
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    // Test case 4: Empty credentials
    console.log('\nTest 4: Empty credentials');
    try {
      await axios.post('http://local-dev.test:5000/api/auth/login', {});
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
};

testInvalidLogin();
