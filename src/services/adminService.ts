import { UserService, UserProfile } from './firebaseService';
import { auth } from '../firebase/config';

// Advanced Admin Identification Service
export class AdminService {
  private static readonly ADMIN_EMAILS = [
    'admin@bingogame.com',
    'superadmin@bingogame.com',
    'support@bingogame.com'
  ];

  private static readonly ADMIN_PHONE_NUMBERS = [
    '+251911234567',
    '+251922345678',
    '+251933456789'
  ];

  private static readonly ADMIN_UIDs: string[] = [
    // Add specific admin UIDs here
  ];

  // Check if user is admin using multiple methods
  static async isUserAdmin(): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;

      const userProfile = await UserService.getUserProfile();
      if (!userProfile) return false;

      // Method 1: Check isAdmin flag in profile
      if (userProfile.isAdmin) {
        return true;
      }

      // Method 2: Check admin email addresses
      if (this.ADMIN_EMAILS.includes(currentUser.email || '')) {
        await this.grantAdminAccess(userProfile.id);
        return true;
      }

      // Method 3: Check admin phone numbers
      if (userProfile.phoneNumber && this.ADMIN_PHONE_NUMBERS.includes(userProfile.phoneNumber)) {
        await this.grantAdminAccess(userProfile.id);
        return true;
      }

      // Method 4: Check admin UIDs
      if (this.ADMIN_UIDs.includes(currentUser.uid)) {
        await this.grantAdminAccess(userProfile.id);
        return true;
      }

      // Method 5: Check Telegram ID (for Telegram Mini App)
      if (userProfile.telegramId && this.isTelegramAdmin(userProfile.telegramId)) {
        await this.grantAdminAccess(userProfile.id);
        return true;
      }

      // Method 6: Check creation date (first users are admins)
      if (await this.isFirstUser(userProfile)) {
        await this.grantAdminAccess(userProfile.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Grant admin access to user
  static async grantAdminAccess(userId: string): Promise<void> {
    try {
      await UserService.updateUserProfile({ isAdmin: true });
      
      // Log admin access grant
      console.log(`Admin access granted to user: ${userId}`);
      
      // You could also send a notification or log to analytics
      this.logAdminAction('admin_access_granted', userId);
    } catch (error) {
      console.error('Error granting admin access:', error);
      throw error;
    }
  }

  // Revoke admin access
  static async revokeAdminAccess(userId: string): Promise<void> {
    try {
      await UserService.updateUserProfile({ isAdmin: false });
      
      console.log(`Admin access revoked from user: ${userId}`);
      this.logAdminAction('admin_access_revoked', userId);
    } catch (error) {
      console.error('Error revoking admin access:', error);
      throw error;
    }
  }

  // Check if user is first user (first registered user gets admin)
  private static async isFirstUser(userProfile: UserProfile): Promise<boolean> {
    try {
      // This would need to be implemented based on your user creation logic
      // For now, we'll check if the user was created in the first week of the app
      const creationDate = userProfile.createdAt.toDate();
      const appLaunchDate = new Date('2024-01-01'); // Set your app launch date
      const oneWeekLater = new Date(appLaunchDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      return creationDate <= oneWeekLater;
    } catch (error) {
      console.error('Error checking if first user:', error);
      return false;
    }
  }

  // Check if Telegram ID is admin
  private static isTelegramAdmin(telegramId: string): boolean {
    // Add your Telegram admin IDs here
    const telegramAdminIds = [
      '123456789',
      '987654321'
    ];
    return telegramAdminIds.includes(telegramId);
  }

  // Get current user
  static getCurrentUser() {
    return auth.currentUser;
  }

  // Log admin actions for security
  private static logAdminAction(action: string, userId: string): void {
    const logData = {
      action,
      userId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'client-ip' // You'd get this from your backend
    };

    // Send to your logging service
    console.log('Admin Action Log:', logData);
    
    // You could send this to Firebase Analytics or your own logging service
    // analytics.logEvent('admin_action', logData);
  }

  // Verify admin permissions for specific actions
  static async verifyAdminPermission(action: string): Promise<boolean> {
    const isAdmin = await this.isUserAdmin();
    if (!isAdmin) {
      console.warn(`Non-admin user attempted ${action}`);
      return false;
    }
    return true;
  }

  // Get admin statistics
  static async getAdminStats(): Promise<any> {
    if (!await this.verifyAdminPermission('get_admin_stats')) {
      throw new Error('Insufficient permissions');
    }

    // Return admin statistics
    return {
      totalAdmins: this.ADMIN_EMAILS.length + this.ADMIN_PHONE_NUMBERS.length + this.ADMIN_UIDs.length,
      adminMethods: ['email', 'phone', 'uid', 'telegram', 'first_user'],
      lastAdminCheck: new Date().toISOString()
    };
  }
} 