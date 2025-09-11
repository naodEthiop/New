import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  User,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { db, auth, googleProvider } from '../firebase/config';

// Types
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  balance: number;
  isAdmin: boolean;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  telegramId?: string;
  phoneNumber?: string;
  level?: number;
  experience?: number;
  gamesPlayed?: number;
  gamesWon?: number;
  totalEarnings?: number;
  achievements?: string[];
  badges?: string[];
  settings?: {
    soundEnabled?: boolean;
    musicEnabled?: boolean;
    notificationsEnabled?: boolean;
    language?: string;
    theme?: string;
  };
}

export interface Game {
  id: string;
  title: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  players: string[];
  maxPlayers: number;
  entryFee: number;
  prizePool: number;
  winner?: string;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  createdBy: string;
  bingoCard?: number[][];
  calledNumbers: number[];
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'game_entry' | 'game_win' | 'bonus' | 'transfer';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: Timestamp;
  reference?: string;
  paymentMethod?: string;
  recipientId?: string;
  senderId?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  adminResponse?: string;
}

// Authentication Service
export class AuthService {
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await this.updateLastLogin();
      return userCredential.user;
    } catch (error) {
      throw new Error('Failed to sign in');
    }
  }

  static async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await this.createUserProfile(email, displayName);
      return userCredential.user;
    } catch (error) {
      throw new Error('Failed to create account');
    }
  }

  static async signInWithGoogle(): Promise<User> {
    try {
      // Use redirect instead of popup to avoid COOP policy issues
      await signInWithRedirect(auth, googleProvider);
      
      // This will redirect the user, so we need to handle the result when they return
      const result = await getRedirectResult(auth);
      if (result) {
        const user = result.user;
        
        // Check if user profile exists, if not create one
        const existingProfile = await UserService.getUserProfile();
        if (!existingProfile && user.email && user.displayName) {
          await this.createUserProfile(user.email, user.displayName);
        } else if (existingProfile) {
          await this.updateLastLogin();
        }
        
        return user;
      }
      
      throw new Error('No redirect result found');
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw new Error('Failed to sign in with Google');
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error('Failed to sign out');
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error('Failed to send password reset email.');
    }
  }

  static async createUserProfile(email: string, displayName: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    console.log('Creating user profile for:', user.uid, email, displayName);
    const userProfile: Omit<UserProfile, 'id'> = {
      email,
      displayName,
      balance: 0,
      isAdmin: false,
      createdAt: serverTimestamp() as Timestamp,
      lastLogin: serverTimestamp() as Timestamp,
      level: 1,
      experience: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      totalEarnings: 0,
      achievements: [],
      badges: [],
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        notificationsEnabled: true,
        language: 'en',
        theme: 'auto'
      }
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    console.log('User profile created successfully');
  }

  private static async updateLastLogin(): Promise<void> {
    const userQuery = query(collection(db, 'users'), where('email', '==', auth.currentUser?.email));
    const querySnapshot = await getDocs(userQuery);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), {
        lastLogin: serverTimestamp()
      });
    }
  }
}

// User Service
export class UserService {
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const user = auth.currentUser;
      console.log('getUserProfile called for user:', user?.uid, user?.email);
      if (user) {
        console.log('Trying to get profile by UID:', user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          console.log('Found profile by UID');
          return { id: userDoc.id, ...userDoc.data() } as UserProfile;
        }
        console.log('No profile found by UID, trying email query...');
      }
      // Fallback to email query for legacy users
      if (user && user.email) {
        const userQuery = query(collection(db, 'users'), where('email', '==', auth.currentUser?.email));
        const querySnapshot = await getDocs(userQuery);
        
        if (!querySnapshot.empty) {
          console.log('Found profile by email query');
          const userDoc = querySnapshot.docs[0];
          return { id: userDoc.id, ...userDoc.data() } as UserProfile;
        }
        console.log('No profile found by email query either');
      }
      console.log('No profile found, returning null');
      return null;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  static async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const userQuery = query(collection(db, 'users'), where('email', '==', auth.currentUser?.email));
      const querySnapshot = await getDocs(userQuery);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), updates);
      }
    } catch (error) {
      throw new Error('Failed to update user profile');
    }
  }

  static async updateBalance(amount: number): Promise<void> {
    try {
      const userQuery = query(collection(db, 'users'), where('email', '==', auth.currentUser?.email));
      const querySnapshot = await getDocs(userQuery);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const currentBalance = userDoc.data().balance || 0;
        await updateDoc(doc(db, 'users', userDoc.id), {
          balance: currentBalance + amount
        });
      }
    } catch (error) {
      throw new Error('Failed to update balance');
    }
  }

  static async transferFunds(toUserId: string, amount: number): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      // Get current user's profile
      const currentUserQuery = query(collection(db, 'users'), where('email', '==', currentUser.email));
      const currentUserSnapshot = await getDocs(currentUserQuery);
      
      if (currentUserSnapshot.empty) {
        throw new Error('Current user not found');
      }

      const currentUserDoc = currentUserSnapshot.docs[0];
      const currentBalance = currentUserDoc.data().balance || 0;

      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }

      // Get recipient's profile
      const recipientDoc = await getDoc(doc(db, 'users', toUserId));
      if (!recipientDoc.exists()) {
        throw new Error('Recipient not found');
      }

      const recipientBalance = recipientDoc.data().balance || 0;

      // Update both balances in a transaction
      await updateDoc(doc(db, 'users', currentUserDoc.id), {
        balance: currentBalance - amount
      });

      await updateDoc(doc(db, 'users', toUserId), {
        balance: recipientBalance + amount
      });

      // Create transfer transaction records
      const transferData = {
        userId: currentUser.uid,
        type: 'transfer',
        amount: -amount,
        status: 'completed',
        description: `Transfer to ${recipientDoc.data().displayName}`,
        createdAt: serverTimestamp(),
        recipientId: toUserId
      };

      const recipientTransferData = {
        userId: toUserId,
        type: 'transfer',
        amount: amount,
        status: 'completed',
        description: `Transfer from ${currentUserDoc.data().displayName}`,
        createdAt: serverTimestamp(),
        senderId: currentUser.uid
      };

      await addDoc(collection(db, 'transactions'), transferData);
      await addDoc(collection(db, 'transactions'), recipientTransferData);

    } catch (error) {
      throw new Error('Transfer failed: ' + (error as Error).message);
    }
  }

  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserProfile);
    } catch (error) {
      throw new Error('Failed to get all users');
    }
  }

  static async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(10)
      );
      const querySnapshot = await getDocs(usersQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserProfile);
    } catch (error) {
      throw new Error('Failed to search users');
    }
  }
}

// Game Service
export class GameService {
  static async createGame(gameData: Omit<Game, 'id' | 'createdAt' | 'calledNumbers'>): Promise<string> {
    try {
      const game: Omit<Game, 'id'> = {
        ...gameData,
        createdAt: serverTimestamp() as Timestamp,
        calledNumbers: [],
        status: 'waiting'
      };
      
      const docRef = await addDoc(collection(db, 'games'), game);
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create game');
    }
  }

  static async getGames(status?: Game['status']): Promise<Game[]> {
    try {
      let q: any = collection(db, 'games');
      if (status) {
        q = query(q, where('status', '==', status), orderBy('createdAt', 'desc'));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...Object.assign({}, doc.data()) }) as Game);
    } catch (error) {
      throw new Error('Failed to get games');
    }
  }

  static async getLeaderboard(type: 'global' | 'weekly' | 'monthly' = 'global'): Promise<{
    id: string;
    type: string;
    period: string;
    players: Array<{
      playerId: string;
      playerName: string;
      avatar?: string;
      score: number;
      rank: number;
      change: number;
    }>;
    lastUpdated: string;
  }> {
    try {
      const now = new Date();
      const period = type === 'monthly'
        ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        : type === 'weekly'
          ? `${now.getFullYear()}-W${Math.ceil((((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7)}`
          : 'all-time';
      const docId = type === 'global' ? 'global' : `${type}-${period}`;

      const lbDoc = await getDoc(doc(db, 'leaderboards', docId));
      if (lbDoc.exists()) {
        const data: any = lbDoc.data();
        return {
          id: lbDoc.id,
          type: data.type || type,
          period: data.period || period,
          players: Array.isArray(data.players) ? data.players : [],
          lastUpdated: data.lastUpdated || now.toISOString(),
        };
      }

      return {
        id: docId,
        type,
        period,
        players: [],
        lastUpdated: now.toISOString(),
      };
    } catch (error) {
      return {
        id: `${type}-leaderboard`,
        type,
        period: 'all-time',
        players: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  static async getGame(gameId: string): Promise<Game | null> {
    try {
      const docRef = doc(db, 'games', gameId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Game;
      }
      return null;
    } catch (error) {
      throw new Error('Failed to get game');
    }
  }

  static async joinGame(gameId: string, userId: string): Promise<void> {
    try {
      const game = await this.getGame(gameId);
      if (!game) throw new Error('Game not found');
      
      if (game.players.includes(userId)) {
        throw new Error('Already joined this game');
      }
      
      if (game.players.length >= game.maxPlayers) {
        throw new Error('Game is full');
      }
      
      await updateDoc(doc(db, 'games', gameId), {
        players: [...game.players, userId]
      });
    } catch (error) {
      throw new Error('Failed to join game');
    }
  }

  static async startGame(gameId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'games', gameId), {
        status: 'active',
        startedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to start game');
    }
  }

  static async endGame(gameId: string, winnerId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'games', gameId), {
        status: 'completed',
        winner: winnerId,
        endedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to end game');
    }
  }

  static onGameUpdate(gameId: string, callback: (game: Game) => void): () => void {
    return onSnapshot(doc(db, 'games', gameId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Game);
      }
    });
  }
}

// Transaction Service
export class TransactionService {
  static async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
    try {
      const transaction: Omit<Transaction, 'id'> = {
        ...transactionData,
        createdAt: serverTimestamp() as Timestamp
      };
      
      const docRef = await addDoc(collection(db, 'transactions'), transaction);
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create transaction');
    }
  }

  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);
    } catch (error) {
      throw new Error('Failed to get transactions');
    }
  }

  static async updateTransactionStatus(transactionId: string, status: Transaction['status']): Promise<void> {
    try {
      await updateDoc(doc(db, 'transactions', transactionId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to update transaction');
    }
  }

  static async getAllTransactions(): Promise<Transaction[]> {
    try {
      const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);
    } catch (error) {
      throw new Error('Failed to get all transactions');
    }
  }
}

// Support Service
export class SupportService {
  static async createTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const ticket: Omit<SupportTicket, 'id'> = {
        ...ticketData,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };
      
      const docRef = await addDoc(collection(db, 'support_tickets'), ticket);
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create support ticket');
    }
  }

  static async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const q = query(
        collection(db, 'support_tickets'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as SupportTicket);
    } catch (error) {
      throw new Error('Failed to get support tickets');
    }
  }

  static async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<void> {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to update ticket');
    }
  }

  static async getAllTickets(): Promise<SupportTicket[]> {
    try {
      const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as SupportTicket);
    } catch (error) {
      throw new Error('Failed to get all tickets');
    }
  }
}

// Payment Service (Chapa Integration)
export class PaymentService {
  static async createDeposit(amount: number, userId: string): Promise<{ transactionId: string; paymentUrl: string }> {
    try {
      // Create transaction record
      const transactionId = await TransactionService.createTransaction({
        userId,
        type: 'deposit',
        amount,
        status: 'pending',
        description: `Deposit of ${amount} ETB`,
        paymentMethod: 'chapa'
      });

      // In a real implementation, you would call Chapa API here
      // For now, we'll simulate the payment URL
      const paymentUrl = `https://checkout.chapa.co/pay/${transactionId}`;
      
      return { transactionId, paymentUrl };
    } catch (error) {
      throw new Error('Failed to create deposit');
    }
  }

  static async createWithdrawal(amount: number): Promise<string> {
    try {
      const transactionId = await TransactionService.createTransaction({
        userId: auth.currentUser?.uid || '', // Assuming userId is available from auth context
        type: 'withdrawal',
        amount: -amount,
        status: 'pending',
        description: `Withdrawal of ${amount} ETB`,
        paymentMethod: 'bank_transfer'
      });

      // In a real implementation, you would call Chapa API here
      return transactionId;
    } catch (error) {
      throw new Error('Failed to create withdrawal');
    }
  }

  static async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      // In a real implementation, you would verify with Chapa API
      // For now, we'll simulate verification
      await TransactionService.updateTransactionStatus(transactionId, 'completed');
      return true;
    } catch (error) {
      throw new Error('Failed to verify payment');
    }
  }
}

// Admin-only utilities
export class AdminService {
  static async updateLeaderboard(type: 'global' | 'weekly' | 'monthly' = 'global'): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    // Verify admin via users doc
    const adminDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!adminDoc.exists() || !adminDoc.data()?.isAdmin) {
      throw new Error('Admin privileges required');
    }

    // Fetch all users to aggregate scores (allowed by rules for admins)
    const usersSnap = await getDocs(collection(db, 'users'));
    const players = usersSnap.docs.map((d) => {
      const data = d.data() as any;
      const gamesWon = Number(data.gamesWon || 0);
      const gamesPlayed = Number(data.gamesPlayed || 0);
      const level = Number(data.level || 1);
      const experience = Number(data.experience || 0);
      const totalEarnings = Number(data.totalEarnings || 0);
      const score = gamesWon * 100 + gamesPlayed * 10 + level * 50 + Math.floor(experience / 10) + Math.floor(totalEarnings);
      return {
        playerId: d.id,
        playerName: data.displayName || data.email || 'Player',
        avatar: data.photoURL || '',
        score,
        rank: 0,
        change: 0,
      };
    });

    players.sort((a, b) => b.score - a.score);
    players.forEach((p, i) => { p.rank = i + 1; });

    const now = new Date();
    const period = type === 'monthly'
      ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      : type === 'weekly'
        ? `${now.getFullYear()}-W${Math.ceil((((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7)}`
        : 'all-time';
    const docId = type === 'global' ? 'global' : `${type}-${period}`;

    await setDoc(doc(db, 'leaderboards', docId), {
      id: docId,
      type,
      period,
      players,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  }
}
