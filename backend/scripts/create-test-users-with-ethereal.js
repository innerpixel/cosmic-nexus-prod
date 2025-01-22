import fetch from 'node-fetch';

async function createTestUser() {
  console.log('Creating test user with specific Ethereal credentials...');
  
  const user = {
    displayName: "John Smith",
    csmclName: "johnsmith",
    simNumber: "41771234001",
    password: "TestPass123!",
    regularEmail: "gapxpysae3gto5p2@ethereal.email"  // Using the specific Ethereal email
  };

  try {
    console.log(`\nUsing Ethereal account:`);
    console.log(`Email: ${user.regularEmail}`);
    console.log(`Password: DAqCPZjE39su3bbbcg`);

    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
    
    const data = await response.json();
    console.log(`\nRegistered user ${user.displayName}:`, data.status);
    if (data.message) {
      console.log('Message:', data.message);
    }
    
  } catch (error) {
    console.error(`Failed to register user ${user.displayName}:`, error.message);
  }
  
  console.log('\nTo view verification email:');
  console.log('1. Go to https://ethereal.email');
  console.log('2. Login with:');
  console.log(`   Email: ${user.regularEmail}`);
  console.log('   Password: DAqCPZjE39su3bbbcg');
}

createTestUser().catch(console.error);
