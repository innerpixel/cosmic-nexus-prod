import fetch from 'node-fetch';

async function createTestUser() {
  console.log('Creating test user with unique Ethereal credentials...');
  
  const timestamp = Date.now();
  const verificationToken = '123456789';
  
  const user = {
    displayName: "John Smith",
    csmclName: `johnsmith${timestamp}`,
    simNumber: `${timestamp}`,
    password: "TestPass123!",
    regularEmail: `test${timestamp}@ethereal.email`,
    verificationToken,
    verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    });

    const data = await response.json();
    console.log('\nRegistered user John Smith:', data.status);
    console.log('Message:', data.message);
    console.log('\nVerification Token:', verificationToken);

  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
