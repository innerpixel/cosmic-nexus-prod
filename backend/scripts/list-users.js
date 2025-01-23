import { MongoClient } from 'mongodb';

async function listUsers() {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    try {
        const db = client.db('csmcl');
        const users = await db.collection('users').find({}).toArray();
        
        console.log('\nTotal users:', users.length);
        console.log('\nUser list:');
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. Display Name: ${user.displayName || 'N/A'}`);
            console.log(`   CSMCL Name: ${user.csmclName || 'N/A'}`);
            console.log(`   Regular Email: ${user.regularEmail || 'N/A'}`);
            console.log(`   Cosmical Email: ${user.cosmicalEmail || 'N/A'}`);
            console.log(`   SIM Number: ${user.simNumber || 'N/A'}`);
            console.log(`   Email Verified: ${user.isEmailVerified ? 'Yes' : 'No'}`);
            console.log(`   Created At: ${user.createdAt}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

listUsers();
