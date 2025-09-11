import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  
} from 'firebase/firestore';

export interface SystemSettings {
  platformName: string;
  version: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxPlayersPerGame: number;
  minEntryFee: number;
  maxEntryFee: number;
  houseCommissionRate: number;
  dailyBonusAmount: number;
  referralBonusAmount: number;
  maxDailyTransfers: number;
  maxTransferAmount: number;
  securityLevel: 'basic' | 'enhanced' | 'premium';
  telegramBotEnabled: boolean;
  telegramBotToken?: string;
  telegramChannelId?: string;
  emailVerificationRequired: boolean;
  twoFactorRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  details: string;
  targetUserId?: string;
  targetGameId?: string;
  amount?: number;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface GameHistory {
  id: string;
  gameId: string;
  gameName: string;
  hostId: string;
  hostName: string;
  players: string[];
  playerCount: number;
  entryFee: number;
  prizePool: number;
  winnerId?: string;
  winnerName?: string;
  gameDuration: number; // in minutes
  status: 'completed' | 'cancelled' | 'interrupted';
  startedAt: Date;
  endedAt: Date;
  createdAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  category: 'technical' | 'billing' | 'game' | 'security' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  adminNotes?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

class SystemSetupService {
  private async createCollectionIfNotExists() {
    try {
      // Try to get one document to see if collection exists
      // const snapshot = await getDocs(collection(db, collectionName));
      return true;
    } catch (error) {
      return false;
    }
  }

  async initializeSystemSettings(): Promise<void> {
    try {
      const settingsDoc = doc(db, 'system_settings', 'main');
      const existingDoc = await getDoc(settingsDoc);
      
      if (!existingDoc.exists()) {
        const defaultSettings: SystemSettings = {
          platformName: 'Abyssinia Bingo Game',
          version: '1.0.0',
          maintenanceMode: false,
          registrationEnabled: true,
          maxPlayersPerGame: 50,
          minEntryFee: 10,
          maxEntryFee: 10000,
          houseCommissionRate: 0.10, // 10%
          dailyBonusAmount: 100,
          referralBonusAmount: 50,
          maxDailyTransfers: 5000,
          maxTransferAmount: 10000,
          securityLevel: 'enhanced',
          telegramBotEnabled: false,
          emailVerificationRequired: true,
          twoFactorRequired: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(settingsDoc, defaultSettings);
      }
    } catch (error) {
      throw error;
    }
  }

  async createInitialAdminLog(adminId: string, action: string, details: string): Promise<void> {
    try {
      const adminLog: Omit<AdminLog, 'id'> = {
        adminId,
        action,
        details,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        severity: 'medium'
      };

      await setDoc(doc(collection(db, 'admin_logs')), adminLog);
    } catch (error) {
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'Unknown';
    }
  }

  async initializeCollections(): Promise<void> {
    const collections = [
      'system_settings',
      'admin_logs',
      'game_history',
      'user_sessions',
      'support_tickets',
      'player_transfers',
      'wallet_security_logs',
      'dailyStreaks',
      'invitationRewards',
      'withdrawals',
      'payments'
    ];

    for (const _ of collections) {
      await this.createCollectionIfNotExists();
    }
  }

  async createSampleData(): Promise<void> {
    try {
      // Create sample admin log
      await this.createInitialAdminLog(
        'system',
        'SYSTEM_INITIALIZATION',
        'System setup completed successfully'
      );

      // Create sample support ticket
      const sampleTicket: Omit<SupportTicket, 'id'> = {
        userId: 'sample_user',
        userName: 'Sample User',
        userEmail: 'sample@example.com',
        subject: 'Welcome to Abyssinia Bingo Game',
        message: 'This is a sample support ticket to demonstrate the system.',
        category: 'general',
        priority: 'low',
        status: 'resolved',
        adminNotes: 'Sample ticket for demonstration purposes',
        resolution: 'System is working correctly',
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: new Date()
      };

      await setDoc(doc(collection(db, 'support_tickets')), sampleTicket);
    } catch (error) {
    }
  }

  async setupTelegramIntegration(botToken: string, channelId: string): Promise<void> {
    try {
      const telegramDoc = doc(db, 'telegram_bot', 'config');
      const telegramConfig = {
        botToken,
        channelId,
        isEnabled: true,
        lastMessageSent: null,
        messageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(telegramDoc, telegramConfig);
    } catch (error) {
      throw error;
    }
  }

  async createUserSession(userId: string, sessionToken: string): Promise<void> {
    try {
      const session: Omit<UserSession, 'id'> = {
        userId,
        sessionToken,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        location: 'Unknown', // In production, use IP geolocation
        deviceInfo: {
          browser: this.getBrowserInfo(),
          os: this.getOSInfo(),
          device: this.getDeviceInfo()
        },
        isActive: true,
        lastActivity: new Date(),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      await setDoc(doc(collection(db, 'user_sessions')), session);
    } catch (error) {
    }
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOSInfo(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android/i.test(userAgent)) return 'Mobile';
    if (/Tablet|iPad/i.test(userAgent)) return 'Tablet';
    return 'Desktop';
  }

  async logGameHistory(gameData: Omit<GameHistory, 'id'>): Promise<void> {
    try {
      await setDoc(doc(collection(db, 'game_history')), gameData);
    } catch (error) {
    }
  }

  async createSupportTicket(ticketData: Omit<SupportTicket, 'id'>): Promise<string> {
    try {
      const ticketRef = doc(collection(db, 'support_tickets'));
      await setDoc(ticketRef, ticketData);
      return ticketRef.id;
    } catch (error) {
      throw error;
    }
  }

  async getSystemSettings(): Promise<SystemSettings | null> {
    try {
      const settingsDoc = await getDoc(doc(db, 'system_settings', 'main'));
      if (settingsDoc.exists()) {
        return settingsDoc.data() as SystemSettings;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async updateSystemSettings(updates: Partial<SystemSettings>): Promise<void> {
    try {
      const settingsDoc = doc(db, 'system_settings', 'main');
      await setDoc(settingsDoc, {
        ...updates,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      throw error;
    }
  }

  async fullSystemSetup(): Promise<void> {
    try {
      // Initialize collections
      await this.initializeCollections();
      
      // Initialize system settings
      await this.initializeSystemSettings();
      
      // Create sample data
      await this.createSampleData();
    } catch (error) {
      throw error;
    }
  }
}

export const systemSetupService = new SystemSetupService(); 