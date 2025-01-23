import axios from 'axios';
import https from 'https';

const testInvalidLogin = async () => {
  try {
    // Create axios instance that ignores SSL verification for local development
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      })
    });

    // Test case 1: Wrong password
    console.log('\nTest 1: Wrong password');
    try {
      await axiosInstance.post('https://local-dev.test/api/auth/login', {
        email: 'nova@local-dev.test',
        password: 'WrongPassword123!'
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    // Test case 2: Non-existent email
    console.log('\nTest 2: Non-existent email');
    try {
      await axiosInstance.post('https://local-dev.test/api/auth/login', {
        email: 'nonexistent@local-dev.test',
        password: 'StardustPath789!'
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    // Test case 3: Invalid email format
    console.log('\nTest 3: Invalid email format');
    try {
      await axiosInstance.post('https://local-dev.test/api/auth/login', {
        email: 'invalid.email',
        password: 'StardustPath789!'
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    // Test case 4: Empty credentials
    console.log('\nTest 4: Empty credentials');
    try {
      await axiosInstance.post('https://local-dev.test/api/auth/login', {
        email: '',
        password: ''
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
};

testInvalidLogin();
