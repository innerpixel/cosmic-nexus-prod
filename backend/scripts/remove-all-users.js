import { MongoClient } from 'mongodb';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function removeAllUsers() {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    try {
        const db = client.db('csmcl');
        
        // First count how many users we have
        const count = await db.collection('users').countDocuments();
        console.log(`\nFound ${count} users in the database.`);
        
        // Ask for confirmation
        const answer = await new Promise(resolve => {
            rl.question('\nAre you sure you want to remove ALL users? This action cannot be undone! (yes/no): ', resolve);
        });

        if (answer.toLowerCase() === 'yes') {
            const result = await db.collection('users').deleteMany({});
            console.log(`\nSuccessfully removed ${result.deletedCount} users from the database.`);
        } else {
            console.log('\nOperation cancelled. No users were removed.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        rl.close();
        await client.close();
    }
}

removeAllUsers();
