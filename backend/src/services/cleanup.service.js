import User from '../models/user.model.js';
import linuxUserService from './linux-user.service.js';
import mailService from './mail.service.js';

class CleanupService {
  constructor() {
    // Get configuration from environment variables
    this.warningHours = parseInt(process.env.CLEANUP_WARNING_HOURS) || 4;
    this.expiryHours = parseInt(process.env.CLEANUP_EXPIRY_HOURS) || 48;
    this.deleteDays = parseInt(process.env.CLEANUP_DELETE_DAYS) || 7;
  }

  async cleanupExpiredUsers() {
    try {
      console.log('Starting cleanup of expired users...');

      // Find users approaching expiration
      const warningThreshold = new Date(Date.now() + this.warningHours * 60 * 60 * 1000);
      const approachingExpiration = await User.find({
        registrationExpires: { 
          $gt: new Date(),
          $lt: warningThreshold 
        },
        isExpired: false,
        $or: [
          { isEmailVerified: false },
          { isSimVerified: false }
        ]
      });

      // Send warning emails
      for (const user of approachingExpiration) {
        try {
          const hoursLeft = Math.ceil((user.registrationExpires - new Date()) / (1000 * 60 * 60));
          await mailService.sendExpirationWarningEmail(
            user.regularEmail,
            user.displayName,
            hoursLeft
          );
          console.log(`Sent warning email to ${user.csmclName}`);
        } catch (error) {
          console.error(`Failed to send warning email to ${user.csmclName}:`, error);
        }
      }

      // Find expired unverified users
      const expiredUsers = await User.find({
        registrationExpires: { $lt: new Date() },
        isExpired: false,
        $or: [
          { isEmailVerified: false },
          { isSimVerified: false }
        ]
      });

      console.log(`Found ${expiredUsers.length} expired users to clean up`);

      for (const user of expiredUsers) {
        try {
          // Mark as expired first
          user.isExpired = true;
          await user.save();

          // If Linux user was somehow created, remove it
          if (user.linuxUserCreated) {
            await linuxUserService.deleteUser(user.csmclName);
          }

          // Send expiration notification
          await mailService.sendExpirationNotificationEmail(
            user.regularEmail,
            user.displayName
          );

          // Log the cleanup
          console.log(`Cleaned up expired user: ${user.csmclName}`);
        } catch (error) {
          console.error(`Failed to clean up user ${user.csmclName}:`, error);
        }
      }

      // Remove expired users after specified days
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() - this.deleteDays);

      const deleteResult = await User.deleteMany({
        isExpired: true,
        updatedAt: { $lt: deletionDate }
      });

      console.log(`Deleted ${deleteResult.deletedCount} expired users`);

      return {
        warningCount: approachingExpiration.length,
        expiredCount: expiredUsers.length,
        deletedCount: deleteResult.deletedCount
      };
    } catch (error) {
      console.error('Cleanup service error:', error);
      throw error;
    }
  }

  // Method to check if a user is expired
  async isUserExpired(userId) {
    const user = await User.findById(userId);
    if (!user) return true;

    // Check if already marked as expired
    if (user.isExpired) return true;

    // Check if registration period expired
    if (user.registrationExpires < new Date() && 
        (!user.isEmailVerified || !user.isSimVerified)) {
      user.isExpired = true;
      await user.save();
      
      // Send expiration notification
      try {
        await mailService.sendExpirationNotificationEmail(
          user.regularEmail,
          user.displayName
        );
      } catch (error) {
        console.error(`Failed to send expiration email to ${user.csmclName}:`, error);
      }
      
      return true;
    }

    return false;
  }
}

export default new CleanupService();
