import axios from 'axios';

const testRegistration = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      displayName: "Test User",
      csmclName: "testuser123",
      regularEmail: "your.email@example.com",  // Replace with your email
      simNumber: "1234567890",
      password: "TestPass123!"
    });

    console.log('Registration Response:', response.data);
  } catch (error) {
    console.error('Registration Error:', error.response?.data || error.message);
  }
};

testRegistration();
