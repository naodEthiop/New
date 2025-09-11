import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/config';

export interface DailyStreak {
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: Timestamp;
  totalDaysPlayed: number;
  bonusEarned: number;
  gamesJoined: number; // Track games joined
  gamesPlayed: number; // Track games actually played
}

export interface InvitationReward {
  inviterId: string;
  inviteeId: string;
  rewardAmount: number;
  status: 'pending' | 'claimed' | 'expired';
  createdAt: Timestamp;
  claimedAt?: Timestamp;
}

export interface BonusConfig {
  dailyBonus: number;
  streakBonus: number;
  invitationBonus: number;
  maxStreakBonus: number;
  minGamesForBonus: number; // Minimum games to qualify for daily bonus
  minDaysForBonus: number; // Minimum days to qualify for daily bonus
  invitationThreshold: number; // Number of invitations needed for bonus
}

class BonusService {
  private readonly BONUS_CONFIG: BonusConfig = {
    dailyBonus: 5, // 5 ETB for daily login (only if qualified)
    streakBonus: 0, // No streak bonus in new system
    invitationBonus: 10, // 10 ETB for 2 successful invitations
    maxStreakBonus: 0, // No max streak bonus
    minGamesForBonus: 1, // Must have joined at least 1 game
    minDaysForBonus: 3, // Must have played for at least 3 days
    invitationThreshold: 2 // Need 2 successful invitations for bonus
  };

  async checkAndAwardDailyBonus(userId: string): Promise<{ awarded: boolean; amount: number; streak: number; message: string; qualified: boolean }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const streakRef = doc(db, 'dailyStreaks', userId);
      const streakDoc = await getDoc(streakRef);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streakData: DailyStreak;

      if (!streakDoc.exists()) {
        // New user, create streak record
        streakData = {
          currentStreak: 1,
          longestStreak: 1,
          lastPlayDate: serverTimestamp() as Timestamp,
          totalDaysPlayed: 1,
          bonusEarned: 0, // No bonus for new users
          gamesJoined: 0,
          gamesPlayed: 0
        };
        
        try {
          await setDoc(streakRef, streakData as any);
        } catch (error) {
          console.error('Failed to create streak record:', error);
          // Fallback: return not qualified for new users
          return {
            awarded: false,
            amount: 0,
            streak: 1,
            message: 'New users need to join and play games for 3 days to qualify for daily bonuses.',
            qualified: false
          };
        }
      } else {
        streakData = streakDoc.data() as DailyStreak;
        const lastPlayDate = streakData.lastPlayDate.toDate();
        lastPlayDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today.getTime() - lastPlayDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          // Already played today
          const qualified = this.isQualifiedForBonus(streakData);
          return {
            awarded: false,
            amount: 0,
            streak: streakData.currentStreak,
            message: qualified ? 'You have already claimed your daily bonus today!' : 'You need to join and play games for 3 days to qualify for daily bonuses.',
            qualified
          };
        } else if (daysDiff === 1) {
          // Consecutive day
          streakData.currentStreak += 1;
          streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
        } else {
          // Streak broken
          streakData.currentStreak = 1;
        }
        
        streakData.lastPlayDate = serverTimestamp() as Timestamp;
        streakData.totalDaysPlayed += 1;
        
        // Check if user qualifies for bonus
        const qualified = this.isQualifiedForBonus(streakData);
        
        if (!qualified) {
          // Update streak data but don't award bonus
          try {
            await updateDoc(streakRef, streakData as any);
          } catch (error) {
            console.error('Failed to update streak record:', error);
          }
          
          return {
            awarded: false,
            amount: 0,
            streak: streakData.currentStreak,
            message: `You need to join and play games for ${this.BONUS_CONFIG.minDaysForBonus} days to qualify for daily bonuses. (${streakData.totalDaysPlayed}/${this.BONUS_CONFIG.minDaysForBonus} days, ${streakData.gamesJoined} games joined)`,
            qualified: false
          };
        }
        
        // User qualifies for bonus
        const bonusAmount = this.BONUS_CONFIG.dailyBonus;
        streakData.bonusEarned += bonusAmount;
        
        try {
          await updateDoc(streakRef, streakData as any);
        } catch (error) {
          console.error('Failed to update streak record:', error);
          // Continue with bonus award even if streak update fails
        }
        
        // Update user wallet
        try {
          const walletRef = doc(db, 'wallets', userId);
          await updateDoc(walletRef, {
            balance: increment(bonusAmount),
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Failed to update wallet:', error);
          throw new Error('Failed to update wallet balance');
        }
        
        return {
          awarded: true,
          amount: bonusAmount,
          streak: streakData.currentStreak,
          message: `Daily bonus awarded! +${bonusAmount} ETB (Qualified player bonus)`,
          qualified: true
        };
      }
      
      // For new users, no bonus awarded
      return {
        awarded: false,
        amount: 0,
        streak: 1,
        message: 'New users need to join and play games for 3 days to qualify for daily bonuses.',
        qualified: false
      };
      
    } catch (error) {
      console.error('Error awarding daily bonus:', error);
      throw new Error('Failed to award daily bonus');
    }
  }

  private isQualifiedForBonus(streakData: DailyStreak): boolean {
    return streakData.totalDaysPlayed >= this.BONUS_CONFIG.minDaysForBonus && 
           streakData.gamesJoined >= this.BONUS_CONFIG.minGamesForBonus;
  }

  async getDailyStreak(userId: string): Promise<DailyStreak | null> {
    try {
      const streakRef = doc(db, 'dailyStreaks', userId);
      const streakDoc = await getDoc(streakRef);
      
      if (!streakDoc.exists()) {
        return null;
      }
      
      return streakDoc.data() as DailyStreak;
    } catch (error: any) {
      console.error('Error getting daily streak:', error);
      
      // Handle specific Firebase permission errors
      if (error.code === 'permission-denied') {
        console.warn('Permission denied for daily streak. This might be due to Firestore rules not being deployed yet.');
        return null;
      }
      
      if (error.code === 'unavailable') {
        console.warn('Firebase service unavailable. Returning null for streak data.');
        return null;
      }
      
      // For other errors, return null gracefully
      return null;
    }
  }

  // Track when user joins a game
  async trackGameJoined(userId: string): Promise<void> {
    try {
      const streakRef = doc(db, 'dailyStreaks', userId);
      const streakDoc = await getDoc(streakRef);
      
      if (streakDoc.exists()) {
        await updateDoc(streakRef, {
          gamesJoined: increment(1)
        });
      } else {
        // Create new streak record for user
        await setDoc(streakRef, {
          currentStreak: 1,
          longestStreak: 1,
          lastPlayDate: serverTimestamp(),
          totalDaysPlayed: 1,
          bonusEarned: 0,
          gamesJoined: 1,
          gamesPlayed: 0
        });
      }
    } catch (error) {
      console.error('Error tracking game joined:', error);
    }
  }

  // Track when user completes a game
  async trackGamePlayed(userId: string): Promise<void> {
    try {
      const streakRef = doc(db, 'dailyStreaks', userId);
      const streakDoc = await getDoc(streakRef);
      
      if (streakDoc.exists()) {
        await updateDoc(streakRef, {
          gamesPlayed: increment(1)
        });
      }
    } catch (error) {
      console.error('Error tracking game played:', error);
    }
  }

  async processInvitationReward(inviterId: string, inviteeId: string): Promise<void> {
    try {
      // Get current invitation count for inviter
      const inviterStreakRef = doc(db, 'dailyStreaks', inviterId);
      const inviterStreakDoc = await getDoc(inviterStreakRef);
      
      let currentInvitations = 0;
      if (inviterStreakDoc.exists()) {
        const inviterData = inviterStreakDoc.data() as DailyStreak;
        currentInvitations = inviterData.bonusEarned / this.BONUS_CONFIG.invitationBonus; // Calculate from bonus earned
      }
      
      // Create invitation reward record
      const rewardRef = doc(db, 'invitationRewards', `${inviterId}_${inviteeId}`);
      const rewardData: InvitationReward = {
        inviterId,
        inviteeId,
        rewardAmount: this.BONUS_CONFIG.invitationBonus,
        status: 'pending',
        createdAt: serverTimestamp() as Timestamp
      };
      
      try {
        await setDoc(rewardRef, rewardData);
      } catch (error) {
        console.error('Failed to create invitation reward record:', error);
        // Continue with wallet update even if reward record fails
      }
      
      // Check if inviter has reached the threshold for bonus
      const newInvitationCount = currentInvitations + 1;
      if (newInvitationCount >= this.BONUS_CONFIG.invitationThreshold) {
        // Award bonus to inviter
        try {
          const walletRef = doc(db, 'wallets', inviterId);
          await updateDoc(walletRef, {
            balance: increment(this.BONUS_CONFIG.invitationBonus),
            updatedAt: serverTimestamp()
          });
          
          // Update streak record to track invitation bonus
          if (inviterStreakDoc.exists()) {
            await updateDoc(inviterStreakRef, {
              bonusEarned: increment(this.BONUS_CONFIG.invitationBonus)
            });
          }
        } catch (error) {
          console.error('Failed to update inviter wallet:', error);
          throw new Error('Failed to process invitation reward');
        }
        
        // Update reward status to claimed
        try {
          await updateDoc(rewardRef, {
            status: 'claimed',
            claimedAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Failed to update reward status:', error);
          // Don't throw error here as the main reward was already given
        }
      }
      
    } catch (error) {
      console.error('Error processing invitation reward:', error);
      throw new Error('Failed to process invitation reward');
    }
  }

  async getInvitationRewards(userId: string): Promise<InvitationReward[]> {
    try {
      const rewardsRef = collection(db, 'invitationRewards');
      const q = query(rewardsRef, where('inviterId', '==', userId));
      const rewardsSnap = await getDocs(q);
      return rewardsSnap.docs.map(doc => doc.data() as InvitationReward);
    } catch (error) {
      console.error('Error getting invitation rewards:', error);
      return [];
    }
  }

  async checkInvitationCode(_code: string): Promise<{ valid: boolean; inviterId?: string; message: string }> {
    try {
      // Search for invitation code in users collection
      // This would need to be implemented with a query
      // For now, returning invalid
      return {
        valid: false,
        message: 'Invalid invitation code'
      };
    } catch (error: any) {
      console.error('Error checking invitation code:', error);
      
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        return {
          valid: false,
          message: 'Service temporarily unavailable'
        };
      }
      
      return {
        valid: false,
        message: 'Error checking invitation code'
      };
    }
  }

  getBonusConfig(): BonusConfig {
    return { ...this.BONUS_CONFIG };
  }

  // Helper method to check if user can claim bonus today
  async canClaimBonusToday(userId: string): Promise<{ canClaim: boolean; qualified: boolean; message: string }> {
    try {
      const streak = await this.getDailyStreak(userId);
      
      if (!streak) {
        return {
          canClaim: false,
          qualified: false,
          message: 'New users need to join and play games for 3 days to qualify for daily bonuses.'
        };
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastPlayDate = streak.lastPlayDate.toDate();
      lastPlayDate.setHours(0, 0, 0, 0);
      
      const alreadyClaimedToday = today.getTime() === lastPlayDate.getTime();
      const qualified = this.isQualifiedForBonus(streak);
      
      if (alreadyClaimedToday) {
        return {
          canClaim: false,
          qualified,
          message: qualified ? 'You have already claimed your daily bonus today!' : 'You need to join and play games for 3 days to qualify for daily bonuses.'
        };
      }
      
      if (!qualified) {
        return {
          canClaim: false,
          qualified: false,
          message: `You need to join and play games for ${this.BONUS_CONFIG.minDaysForBonus} days to qualify for daily bonuses. (${streak.totalDaysPlayed}/${this.BONUS_CONFIG.minDaysForBonus} days, ${streak.gamesJoined} games joined)`
        };
      }
      
      return {
        canClaim: true,
        qualified: true,
        message: `You can claim your daily bonus of ${this.BONUS_CONFIG.dailyBonus} ETB!`
      };
    } catch (error) {
      console.error('Error checking if user can claim bonus:', error);
      return {
        canClaim: false,
        qualified: false,
        message: 'Error checking bonus eligibility'
      };
    }
  }
}

export const bonusService = new BonusService(); 