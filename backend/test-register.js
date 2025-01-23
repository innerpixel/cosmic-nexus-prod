import axios from 'axios';

const testRegistration = async () => {
  try {
    const response = await axios.post('http://localhost:5001/api/auth/register', {
      displayName: "Gandalf The Grey",
      csmclName: "gandalfgrey",
      regularEmail: "gandalf@local-dev.test",
      simNumber: "+12345678921",
      password: "YouShallNotPass789!"
    });

    console.log('Registration Response:', response.data);
  } catch (error) {
    console.error('Registration Error:', error.response?.data || error.message);
  }
};

testRegistration();
