import axios from 'axios';
import https from 'https';

const testRegistration = async () => {
  try {
    // Create axios instance that ignores SSL verification for local development
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      })
    });

    const response = await axiosInstance.post('https://local-dev.test/api/auth/register', {
      displayName: "Nova Explorer",
      csmclName: "novaexplorer",
      regularEmail: "nova@local-dev.test",
      simNumber: "+12345678931",
      password: "StardustPath789!"
    });

    console.log('Registration Response:', response.data);
  } catch (error) {
    console.error('Registration Error:', error.response?.data || error.message);
  }
};

testRegistration();
