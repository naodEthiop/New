export interface Wallet {
  id?: string;
  userId: string;
  balance: number;
  currency: string;
  status: 'active' | 'suspended' | 'closed';
  createdAt: string | Date | any;
  updatedAt: string | Date | any;
  lastUpdated: Date;
  securityLevel: 'basic' | 'enhanced' | 'premium';
  isVerified: boolean;
  transferLimit: number;
  dailyTransferLimit: number;
  dailyTransferUsed: number;
  lastTransferDate: string;
  securityQuestions: {
    question1: string;
    answer1: string;
    question2: string;
    answer2: string;
  };
  twoFactorEnabled: boolean;
  deviceFingerprint: string;
  lastLoginLocation: string;
  suspiciousActivityCount: number;
  isLocked: boolean;
  lockReason?: string;
}

export interface Transaction {
  id?: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'refund' | 'bonus' | 'fee' | 'transfer_sent' | 'transfer_received' | 'admin_transfer_sent' | 'admin_transfer_received' | 'admin_bonus';
  amount: number;
  currency?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  description: string;
  metadata?: {
    gameId?: string;
    paymentMethod?: string;
    chapaReference?: string;
    originalAmount?: number;
    fee?: number;
    multiplier?: number;
  };
  createdAt: Date;
  updatedAt?: any;
  relatedTransferId?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'telebirr' | 'cbe_birr' | 'bank_transfer';
  name: string;
  details: { 
    provider?: string;
    type?: string;
  };
  isActive: boolean;
  fees: {
    deposit: { fixed: number; percentage: number };
    withdrawal: { fixed: number; percentage: number };
  };
  limits: {
    minDeposit: number;
    maxDeposit: number;
    minWithdrawal: number;
    maxWithdrawal: number;
    dailyLimit: number;
  };
}

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