import fetch from 'node-fetch';

const users = [
  {
    displayName: "John Smith",
    csmclName: "johnsmith",
    regularEmail: "john.smith@example.com",
    simNumber: "41771234001",
    password: "TestPass123!"
  },
  {
    displayName: "Emma Wilson",
    csmclName: "emmawilson",
    regularEmail: "emma.wilson@example.com",
    simNumber: "41771234002",
    password: "TestPass123!"
  },
  {
    displayName: "Michael Brown",
    csmclName: "michaelbrown",
    regularEmail: "michael.brown@example.com",
    simNumber: "41771234003",
    password: "TestPass123!"
  },
  {
    displayName: "Sarah Davis",
    csmclName: "sarahdavis",
    regularEmail: "sarah.davis@example.com",
    simNumber: "41771234004",
    password: "TestPass123!"
  },
  {
    displayName: "James Miller",
    csmclName: "jamesmiller",
    regularEmail: "james.miller@example.com",
    simNumber: "41771234005",
    password: "TestPass123!"
  },
  {
    displayName: "Lisa Anderson",
    csmclName: "lisaanderson",
    regularEmail: "lisa.anderson@example.com",
    simNumber: "41771234006",
    password: "TestPass123!"
  },
  {
    displayName: "David Taylor",
    csmclName: "davidtaylor",
    regularEmail: "david.taylor@example.com",
    simNumber: "41771234007",
    password: "TestPass123!"
  },
  {
    displayName: "Anna Martinez",
    csmclName: "annamartinez",
    regularEmail: "anna.martinez@example.com",
    simNumber: "41771234008",
    password: "TestPass123!"
  },
  {
    displayName: "Robert Johnson",
    csmclName: "robertjohnson",
    regularEmail: "robert.johnson@example.com",
    simNumber: "41771234009",
    password: "TestPass123!"
  },
  {
    displayName: "Emily White",
    csmclName: "emilywhite",
    regularEmail: "emily.white@example.com",
    simNumber: "41771234010",
    password: "TestPass123!"
  }
];

async function registerUsers() {
  console.log('Starting user registration...');
  
  for (const user of users) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      
      const data = await response.json();
      console.log(`Registered user ${user.displayName}:`, data.status);
      
      // Add a small delay between registrations
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Failed to register user ${user.displayName}:`, error.message);
    }
  }
  
  console.log('User registration completed');
}

registerUsers();
