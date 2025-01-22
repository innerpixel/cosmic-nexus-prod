import cron from 'node-cron';
import cleanupService from '../services/cleanup.service.js';

// Run cleanup every day at 3 AM
cron.schedule('0 3 * * *', async () => {
  try {
    console.log('Running scheduled user cleanup...');
    const result = await cleanupService.cleanupExpiredUsers();
    console.log('Cleanup completed:', result);
  } catch (error) {
    console.error('Scheduled cleanup failed:', error);
  }
});
