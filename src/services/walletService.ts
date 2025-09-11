import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  runTransaction,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { Wallet, Transaction } from '../types/wallet';

export interface TransferRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  securityCode?: string;
  adminNotes?: string;
  fraudScore?: number;
}

export interface SecurityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  timestamp: Date;
  riskLevel: 'low' | 'medium' | 'high';
}

class WalletService {
  private getCurrentUserId(): string {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    return user.uid;
  }

  private async logSecurityEvent(action: string, details: string, riskLevel: 'low' | 'medium' | 'high' = 'low') {
    try {
      const userId = this.getCurrentUserId();
      const securityLog: Omit<SecurityLog, 'id'> = {
        userId,
        action,
        details,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        location: 'Unknown', // In production, use IP geolocation
        timestamp: new Date(),
        riskLevel
      };

      await addDoc(collection(db, 'wallet_security_logs'), securityLog);
    } catch (error) {
      console.error('Failed to log security event:', error);
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

  private calculateFraudScore(transfer: Partial<TransferRequest>): number {
    let score = 0;
    
    // Check amount patterns
    if (transfer.amount && transfer.amount > 1000) score += 20;
    if (transfer.amount && transfer.amount > 5000) score += 30;
    
    // Check frequency (would need historical data)
    // Check location patterns
    // Check device patterns
    
    return Math.min(score, 100);
  }

  // Create or get wallet for user
  async createWallet(userId: string): Promise<Wallet> {
    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);

    if (walletSnap.exists()) {
      return { id: walletSnap.id, ...walletSnap.data() } as Wallet;
    }

    const newWallet: Omit<Wallet, 'id'> = {
      userId,
      balance: 0,
      currency: 'ETB',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Omit<Wallet, 'id'>;

    await setDoc(walletRef, newWallet);
    return { id: userId, ...newWallet };
  }

  // Get wallet by user ID
  async getWallet(): Promise<Wallet> {
    try {
      const userId = this.getCurrentUserId();
      const walletDoc = await getDoc(doc(db, 'wallets', userId));
      
      if (!walletDoc.exists()) {
        // Create default wallet
        const defaultWallet: Wallet = {
          balance: 0,
          currency: 'ETB',
          lastUpdated: new Date(),
          securityLevel: 'basic',
          isVerified: false,
          transferLimit: 1000,
          dailyTransferLimit: 5000,
          dailyTransferUsed: 0,
          lastTransferDate: new Date().toDateString(),
          securityQuestions: {
            question1: '',
            answer1: '',
            question2: '',
            answer2: ''
          },
          twoFactorEnabled: false,
          deviceFingerprint: this.generateDeviceFingerprint(),
          lastLoginLocation: 'Unknown',
          suspiciousActivityCount: 0,
          isLocked: false,
          userId: userId,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Wallet;
        
        await setDoc(doc(db, 'wallets', userId), defaultWallet);
        return defaultWallet;
      }
      
      return walletDoc.data() as Wallet;
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw error;
    }
  }

  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Device Fingerprint', 10, 10);
    return canvas.toDataURL();
  }

  async updateWallet(updates: Partial<Wallet>): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await updateDoc(doc(db, 'wallets', userId), {
        ...updates,
        lastUpdated: new Date()
      });
      
      await this.logSecurityEvent('WALLET_UPDATED', `Updated wallet fields: ${Object.keys(updates).join(', ')}`);
    } catch (error) {
      console.error('Error updating wallet:', error);
      throw error;
    }
  }

  // Subscribe to wallet changes
  subscribeToWallet(userId: string, callback: (wallet: Wallet | null) => void): () => void {
    try {
      const walletRef = doc(db, 'wallets', userId);

      return onSnapshot(walletRef, (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() } as Wallet);
        } else {
          // Create wallet if it doesn't exist
          this.createWallet(userId).then(callback).catch(() => callback(null));
        }
      }, (error) => {
        console.error('Failed to subscribe to wallet:', error);
        callback(null);
      });
    } catch (error) {
      console.error('Failed to subscribe to wallet:', error);
      return () => {};
    }
  }

  // Subscribe to transactions
  subscribeToTransactions(userId: string, callback: (transactions: Transaction[]) => void): () => void {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
        const transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];
        callback(transactions);
      }, (error) => {
        console.error('Failed to subscribe to transactions:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Failed to subscribe to transactions:', error);
      return () => {};
    }
  }

  // Update wallet balance with transaction
  async updateBalance(userId: string, amount: number, operation: 'add' | 'subtract' = 'add'): Promise<boolean> {
    try {
      const walletRef = doc(db, 'wallets', userId);

      return await runTransaction(db, async (transaction) => {
        const walletDoc = await transaction.get(walletRef);

        if (!walletDoc.exists()) {
          throw new Error('Wallet does not exist');
        }

        const currentBalance = walletDoc.data().balance || 0;
        const newBalance = operation === 'add' 
          ? currentBalance + amount 
          : currentBalance - amount;

        if (newBalance < 0) {
          throw new Error('Insufficient balance');
        }

        transaction.update(walletRef, {
          balance: newBalance,
          updatedAt: serverTimestamp()
        });

        return true;
      });
    } catch (error) {
      console.error('Error updating balance:', error);
      return false;
    }
  }

  // Create transaction record
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string | null> {
    try {
      const transactionData = {
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'transactions'), transactionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  // Process game bet (deduct from wallet)
  async placeBet(userId: string, gameId: string, amount: number, metadata?: any): Promise<boolean> {
    try {
      // Check if user has sufficient balance
      const wallet = await this.getWallet();
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction record first
      const transactionId = await this.createTransaction({
        userId,
        type: 'bet',
        amount,
        status: 'pending',
        description: `Game entry fee for ${gameId}`,
        metadata: { gameId, ...metadata }
      });

      if (!transactionId) {
        throw new Error('Failed to create transaction record');
      }

      // Update wallet balance
      const success = await this.updateBalance(userId, amount, 'subtract');

      if (success) {
        // Update transaction status
        await updateDoc(doc(db, 'transactions', transactionId), {
          status: 'completed',
          updatedAt: serverTimestamp()
        });
      } else {
        // Update transaction status to failed
        await updateDoc(doc(db, 'transactions', transactionId), {
          status: 'failed',
          updatedAt: serverTimestamp()
        });
      }

      return success;
    } catch (error) {
      console.error('Error placing bet:', error);
      return false;
    }
  }

  // Process game win (add to wallet)
  async processWin(userId: string, gameId: string, amount: number, metadata?: any): Promise<boolean> {
    try {
      // Create transaction record
      const transactionId = await this.createTransaction({
        userId,
        type: 'win',
        amount,
        status: 'pending',
        description: `Game winnings from ${gameId}`,
        metadata: { gameId, ...metadata }
      });

      if (!transactionId) {
        throw new Error('Failed to create transaction record');
      }

      // Update wallet balance
      const success = await this.updateBalance(userId, amount, 'add');

      if (success) {
        // Update transaction status
        await updateDoc(doc(db, 'transactions', transactionId), {
          status: 'completed',
          updatedAt: serverTimestamp()
        });
      } else {
        // Update transaction status to failed
        await updateDoc(doc(db, 'transactions', transactionId), {
          status: 'failed',
          updatedAt: serverTimestamp()
        });
      }

      return success;
    } catch (error) {
      console.error('Error processing win:', error);
      return false;
    }
  }

  // Process deposit
  async processDeposit(userId: string, amount: number, paymentMethod: string, metadata?: any): Promise<boolean> {
    try {
      // Create transaction record
      const transactionId = await this.createTransaction({
        userId,
        type: 'deposit',
        amount,
        status: 'pending',
        description: `Deposit via ${paymentMethod}`,
        metadata
      });

      if (!transactionId) {
        throw new Error('Failed to create transaction record');
      }

      // Update wallet balance
      const success = await this.updateBalance(userId, amount, 'add');

      if (success) {
        // Update transaction status
        await updateDoc(doc(db, 'transactions', transactionId), {
          status: 'completed',
          updatedAt: serverTimestamp()
        });
      } else {
        // Update transaction status to failed
        await updateDoc(doc(db, 'transactions', transactionId), {
          status: 'failed',
          updatedAt: serverTimestamp()
        });
      }

      return success;
    } catch (error) {
      console.error('Error processing deposit:', error);
      return false;
    }
  }

  // Process withdrawal
  async processWithdrawal(userId: string, amount: number, paymentMethod: string, metadata?: any): Promise<boolean> {
    try {
      // Check if user has sufficient balance
      const wallet = await this.getWallet();
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction record
      const transactionId = await this.createTransaction({
        userId,
        type: 'withdrawal',
        amount,
        status: 'pending',
        description: `Withdrawal via ${paymentMethod}`,
        metadata
      });

      if (!transactionId) {
        throw new Error('Failed to create transaction record');
      }

      // Update wallet balance
      const success = await this.updateBalance(userId, amount, 'subtract');

      if (success) {
        // Update transaction status
        await updateDoc(doc(db, 'transactions', transactionId), {
          status: 'completed',
          updatedAt: serverTimestamp()
        });
      } else {
        // Update transaction status to failed
        await updateDoc(doc(db, 'transactions', transactionId), {
          status: 'failed',
          updatedAt: serverTimestamp()
        });
      }

      return success;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      return false;
    }
  }

  // Get transaction history
  async getTransactionHistory(userId: string, limitCount: number = 20): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  async transferToPlayer(toUserId: string, amount: number, reason: string, securityCode?: string): Promise<string> {
    try {
      const fromUserId = this.getCurrentUserId();
      
      // Validate transfer
      if (amount <= 0) throw new Error('Invalid transfer amount');
      if (amount > 10000) throw new Error('Transfer amount exceeds maximum limit');
      
      // Get sender's wallet
      const senderWallet = await this.getWallet();
      if (senderWallet.balance < amount) throw new Error('Insufficient balance');
      if (senderWallet.isLocked) throw new Error('Wallet is locked for security reasons');
      
      // Check daily transfer limit
      const today = new Date().toDateString();
      if (senderWallet.lastTransferDate === today && 
          senderWallet.dailyTransferUsed + amount > senderWallet.dailyTransferLimit) {
        throw new Error('Daily transfer limit exceeded');
      }
      
      // Calculate fraud score
      const fraudScore = this.calculateFraudScore({ fromUserId, toUserId, amount, reason });
      
      // Create transfer request
      const transferRequest: Omit<TransferRequest, 'id'> = {
        fromUserId,
        toUserId,
        amount,
        reason,
        status: fraudScore > 70 ? 'pending' : 'pending', // High fraud score requires admin approval
        createdAt: new Date(),
        securityCode,
        fraudScore
      };
      
      const transferRef = await addDoc(collection(db, 'player_transfers'), transferRequest);
      
      // Log security event
      await this.logSecurityEvent(
        'TRANSFER_REQUESTED', 
        `Transfer request created: ${amount} ETB to ${toUserId}`,
        fraudScore > 50 ? 'high' : 'medium'
      );
      
      // If fraud score is low, auto-approve
      if (fraudScore <= 30) {
        await this.approveTransfer(transferRef.id);
      }
      
      return transferRef.id;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  }

  async approveTransfer(transferId: string): Promise<void> {
    try {
      const transferDoc = await getDoc(doc(db, 'player_transfers', transferId));
      if (!transferDoc.exists()) throw new Error('Transfer not found');
      
      const transfer = transferDoc.data() as TransferRequest;
      
      // Use batch to ensure atomicity
      const batch = writeBatch(db);
      
      // Deduct from sender
      const senderWalletRef = doc(db, 'wallets', transfer.fromUserId);
      batch.update(senderWalletRef, {
        balance: increment(-transfer.amount),
        dailyTransferUsed: increment(transfer.amount),
        lastTransferDate: new Date().toDateString()
      });
      
      // Add to receiver
      const receiverWalletRef = doc(db, 'wallets', transfer.toUserId);
      batch.update(receiverWalletRef, {
        balance: increment(transfer.amount)
      });
      
      // Update transfer status
      const transferRef = doc(db, 'player_transfers', transferId);
      batch.update(transferRef, {
        status: 'completed',
        adminNotes: 'Auto-approved by system'
      });
      
      // Create transaction records
      const senderTransaction = {
        userId: transfer.fromUserId,
        type: 'transfer_sent',
        amount: -transfer.amount,
        description: `Transfer to ${transfer.toUserId}: ${transfer.reason}`,
        status: 'completed',
        createdAt: serverTimestamp(),
        relatedTransferId: transferId
      };
      
      const receiverTransaction = {
        userId: transfer.toUserId,
        type: 'transfer_received',
        amount: transfer.amount,
        description: `Transfer from ${transfer.fromUserId}: ${transfer.reason}`,
        status: 'completed',
        createdAt: serverTimestamp(),
        relatedTransferId: transferId
      };
      
      batch.set(doc(collection(db, 'transactions')), senderTransaction);
      batch.set(doc(collection(db, 'transactions')), receiverTransaction);
      
      await batch.commit();
      
      await this.logSecurityEvent('TRANSFER_APPROVED', `Transfer ${transferId} approved`);
    } catch (error) {
      console.error('Error approving transfer:', error);
      throw error;
    }
  }

  async getTransferHistory(): Promise<TransferRequest[]> {
    try {
      const userId = this.getCurrentUserId();
      const q = query(
        collection(db, 'player_transfers'),
        where('fromUserId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransferRequest));
    } catch (error) {
      console.error('Error getting transfer history:', error);
      throw error;
    }
  }

  async getReceivedTransfers(): Promise<TransferRequest[]> {
    try {
      const userId = this.getCurrentUserId();
      const q = query(
        collection(db, 'player_transfers'),
        where('toUserId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransferRequest));
    } catch (error) {
      console.error('Error getting received transfers:', error);
      throw error;
    }
  }

  async setSecurityQuestions(question1: string, answer1: string, question2: string, answer2: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await updateDoc(doc(db, 'wallets', userId), {
        'securityQuestions.question1': question1,
        'securityQuestions.answer1': answer1.toLowerCase().trim(),
        'securityQuestions.question2': question2,
        'securityQuestions.answer2': answer2.toLowerCase().trim(),
        securityLevel: 'enhanced'
      });
      
      await this.logSecurityEvent('SECURITY_QUESTIONS_SET', 'Security questions updated');
    } catch (error) {
      console.error('Error setting security questions:', error);
      throw error;
    }
  }

  async verifySecurityQuestions(question1Answer: string, question2Answer: string): Promise<boolean> {
    try {
      const wallet = await this.getWallet();
      const correct1 = wallet.securityQuestions.answer1 === question1Answer.toLowerCase().trim();
      const correct2 = wallet.securityQuestions.answer2 === question2Answer.toLowerCase().trim();
      
      if (!correct1 || !correct2) {
        await this.logSecurityEvent('SECURITY_QUESTIONS_FAILED', 'Incorrect security answers', 'high');
        return false;
      }
      
      await this.logSecurityEvent('SECURITY_QUESTIONS_VERIFIED', 'Security questions verified');
      return true;
    } catch (error) {
      console.error('Error verifying security questions:', error);
      return false;
    }
  }

  async lockWallet(reason: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await updateDoc(doc(db, 'wallets', userId), {
        isLocked: true,
        lockReason: reason
      });
      
      await this.logSecurityEvent('WALLET_LOCKED', `Wallet locked: ${reason}`, 'high');
    } catch (error) {
      console.error('Error locking wallet:', error);
      throw error;
    }
  }

  async unlockWallet(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await updateDoc(doc(db, 'wallets', userId), {
        isLocked: false,
        lockReason: null
      });
      
      await this.logSecurityEvent('WALLET_UNLOCKED', 'Wallet unlocked');
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      throw error;
    }
  }

  async getSecurityLogs(): Promise<SecurityLog[]> {
    try {
      const userId = this.getCurrentUserId();
      const q = query(
        collection(db, 'wallet_security_logs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SecurityLog));
    } catch (error) {
      console.error('Error getting security logs:', error);
      throw error;
    }
  }

  // Admin functions
  async adminTransfer(fromUserId: string, toUserId: string, amount: number, reason: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Deduct from sender
      const senderWalletRef = doc(db, 'wallets', fromUserId);
      batch.update(senderWalletRef, {
        balance: increment(-amount)
      });
      
      // Add to receiver
      const receiverWalletRef = doc(db, 'wallets', toUserId);
      batch.update(receiverWalletRef, {
        balance: increment(amount)
      });
      
      // Create transaction records
      const senderTransaction = {
        userId: fromUserId,
        type: 'admin_transfer_sent',
        amount: -amount,
        description: `Admin transfer to ${toUserId}: ${reason}`,
        status: 'completed',
        createdAt: serverTimestamp()
      };
      
      const receiverTransaction = {
        userId: toUserId,
        type: 'admin_transfer_received',
        amount: amount,
        description: `Admin transfer from ${fromUserId}: ${reason}`,
        status: 'completed',
        createdAt: serverTimestamp()
      };
      
      batch.set(doc(collection(db, 'transactions')), senderTransaction);
      batch.set(doc(collection(db, 'transactions')), receiverTransaction);
      
      await batch.commit();
      
      await this.logSecurityEvent('ADMIN_TRANSFER', `Admin transfer: ${amount} ETB from ${fromUserId} to ${toUserId}`);
    } catch (error) {
      console.error('Error in admin transfer:', error);
      throw error;
    }
  }

  async adminAddBonus(userId: string, amount: number, reason: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Add to user's wallet
      const walletRef = doc(db, 'wallets', userId);
      batch.update(walletRef, {
        balance: increment(amount)
      });
      
      // Create transaction record
      const transaction = {
        userId,
        type: 'admin_bonus',
        amount,
        description: `Admin bonus: ${reason}`,
        status: 'completed',
        createdAt: serverTimestamp()
      };
      
      batch.set(doc(collection(db, 'transactions')), transaction);
      await batch.commit();
      
      await this.logSecurityEvent('ADMIN_BONUS', `Admin bonus: ${amount} ETB to ${userId} for ${reason}`);
    } catch (error) {
      console.error('Error adding admin bonus:', error);
      throw error;
    }
  }
}

export const walletService = new WalletService();