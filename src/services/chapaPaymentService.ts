import { auth } from '../firebase/config';

/**
 * Chapa Payment Service
 * Handles payment initialization and integration with Chapa payment gateway
 */
export interface ChapaPaymentRequest {
  amount: number;
  email: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  currency?: string;
  tx_ref: string;
  callback_url?: string;
  return_url?: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  metadata?: Record<string, any>;
}

export interface ChapaPaymentResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    checkout_url: string;
    tx_ref: string;
    amount: number;
    currency: string;
    status: string;
  };
  error?: string;
}

export interface ChapaVerificationResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    tx_ref: string;
    amount: number;
    currency: string;
    status: string;
    payment_type: string;
    created_at: string;
    customer: {
      email: string;
      name: string;
      phone_number?: string;
    };
  };
  error?: string;
}

import { auth } from '../firebase/config';

class ChapaPaymentService {
  private backendUrl: string;

  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  }

  /**
   * Get authentication token for API requests
   */
  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  }

  /**
   * Initialize a new payment with Chapa
   * @param paymentData - Payment request data
   * @returns Promise with payment response
   */
  async initiatePayment(paymentData: ChapaPaymentRequest): Promise<ChapaPaymentResponse> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.backendUrl}/api/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment initialization failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Payment initialization failed',
      };
    }
  }

  /**
   * Create a wallet deposit payment
   * @param amount - Amount to deposit
   * @param email - User email
   * @param firstName - User first name
   * @param lastName - User last name (optional)
   * @param phone - User phone number (optional)
   * @returns Promise with payment response
   */
  async createDepositPayment(
    amount: number,
    email: string,
    firstName: string,
    lastName?: string,
    phone?: string
  ): Promise<ChapaPaymentResponse> {
    const txRef = `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentData: ChapaPaymentRequest = {
      amount,
      email,
      first_name: firstName,
      last_name: lastName || 'Player',
      phone,
      currency: 'ETB',
      tx_ref: txRef,
      callback_url: `${this.backendUrl}/api/payment-callback`,
      return_url: `${window.location.origin}/wallet?payment=success`,
      customization: {
        title: 'Bingo Game Wallet Deposit',
        description: `Deposit ${amount} ETB to your Bingo wallet`,
        logo: `${window.location.origin}/logo.png`,
      },
      metadata: {
        type: 'wallet_deposit',
        userId: auth.currentUser?.uid,
        amount,
        currency: 'ETB',
      },
    };

    return this.initiatePayment(paymentData);
  }

  /**
   * Create a game entry payment
   * @param gameId - Game ID
   * @param gameName - Game name
   * @param entryFee - Entry fee amount
   * @param email - User email
   * @param firstName - User first name
   * @param lastName - User last name (optional)
   * @param phone - User phone number (optional)
   * @returns Promise with payment response
   */
  async createGameEntryPayment(
    gameId: string,
    gameName: string,
    entryFee: number,
    email: string,
    firstName: string,
    lastName?: string,
    phone?: string
  ): Promise<ChapaPaymentResponse> {
    const txRef = `game_entry_${gameId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentData: ChapaPaymentRequest = {
      amount: entryFee,
      email,
      first_name: firstName,
      last_name: lastName || 'Player',
      phone,
      currency: 'ETB',
      tx_ref: txRef,
      callback_url: `${this.backendUrl}/api/payment-callback`,
      return_url: `${window.location.origin}/game/${gameId}?payment=success`,
      customization: {
        title: `Game Entry: ${gameName}`,
        description: `Entry fee for ${gameName}`,
        logo: `${window.location.origin}/logo.png`,
      },
      metadata: {
        type: 'game_entry',
        gameId,
        gameName,
        userId: auth.currentUser?.uid,
        amount: entryFee,
        currency: 'ETB',
      },
    };

    return this.initiatePayment(paymentData);
  }

  /**
   * Create a tournament entry payment
   * @param tournamentId - Tournament ID
   * @param tournamentName - Tournament name
   * @param entryFee - Entry fee amount
   * @param email - User email
   * @param firstName - User first name
   * @param lastName - User last name (optional)
   * @param phone - User phone number (optional)
   * @returns Promise with payment response
   */
  async createTournamentEntryPayment(
    tournamentId: string,
    tournamentName: string,
    entryFee: number,
    email: string,
    firstName: string,
    lastName?: string,
    phone?: string
  ): Promise<ChapaPaymentResponse> {
    const txRef = `tournament_entry_${tournamentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentData: ChapaPaymentRequest = {
      amount: entryFee,
      email,
      first_name: firstName,
      last_name: lastName || 'Player',
      phone,
      currency: 'ETB',
      tx_ref: txRef,
      callback_url: `${this.backendUrl}/api/payment-callback`,
      return_url: `${window.location.origin}/tournaments/${tournamentId}?payment=success`,
      customization: {
        title: `Tournament Entry: ${tournamentName}`,
        description: `Entry fee for ${tournamentName}`,
        logo: `${window.location.origin}/logo.png`,
      },
      metadata: {
        type: 'tournament_entry',
        tournamentId,
        tournamentName,
        userId: auth.currentUser?.uid,
        amount: entryFee,
        currency: 'ETB',
      },
    };

    return this.initiatePayment(paymentData);
  }

  /**
   * Create a power-up purchase payment
   * @param powerUpId - Power-up ID
   * @param powerUpName - Power-up name
   * @param cost - Power-up cost
   * @param email - User email
   * @param firstName - User first name
   * @param lastName - User last name (optional)
   * @param phone - User phone number (optional)
   * @returns Promise with payment response
   */
  async createPowerUpPayment(
    powerUpId: string,
    powerUpName: string,
    cost: number,
    email: string,
    firstName: string,
    lastName?: string,
    phone?: string
  ): Promise<ChapaPaymentResponse> {
    const txRef = `powerup_${powerUpId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentData: ChapaPaymentRequest = {
      amount: cost,
      email,
      first_name: firstName,
      last_name: lastName || 'Player',
      phone,
      currency: 'ETB',
      tx_ref: txRef,
      callback_url: `${this.backendUrl}/api/payment-callback`,
      return_url: `${window.location.origin}/store?payment=success`,
      customization: {
        title: `Power-up Purchase: ${powerUpName}`,
        description: `Purchase ${powerUpName} for ${cost} ETB`,
        logo: `${window.location.origin}/logo.png`,
      },
      metadata: {
        type: 'powerup_purchase',
        powerUpId,
        powerUpName,
        userId: auth.currentUser?.uid,
        amount: cost,
        currency: 'ETB',
      },
    };

    return this.initiatePayment(paymentData);
  }

  /**
   * Verify a payment transaction
   * @param txRef - Transaction reference
   * @returns Promise with verification response
   */
  async verifyPayment(txRef: string): Promise<ChapaVerificationResponse> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.backendUrl}/api/payment/verify/${txRef}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment verification failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Payment verification failed',
      };
    }
  }

  /**
   * Get payment history for the current user
   * @param limit - Number of payments to retrieve (default: 20)
   * @param offset - Number of payments to skip (default: 0)
   * @returns Promise with payment history
   */
  async getPaymentHistory(limit: number = 20, offset: number = 0): Promise<any> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.backendUrl}/api/payment/history?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment history');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment history error:', error);
      throw error;
    }
  }

  /**
   * Redirect to Chapa checkout page
   * @param checkoutUrl - Chapa checkout URL
   */
  redirectToCheckout(checkoutUrl: string): void {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      throw new Error('Invalid checkout URL');
    }
  }

  /**
   * Handle payment success callback
   * @param txRef - Transaction reference
   * @param status - Payment status
   */
  async handlePaymentSuccess(txRef: string, status: string): Promise<void> {
    try {
      // Verify the payment
      const verification = await this.verifyPayment(txRef);
      
      if (verification.status === 'success' && verification.data?.status === 'success') {
        // Payment is confirmed, you can update UI or redirect
        console.log('Payment successful:', verification.data);
        
        // You can emit an event or update global state here
        window.dispatchEvent(new CustomEvent('paymentSuccess', {
          detail: verification.data
        }));
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment success handling error:', error);
      throw error;
    }
  }

  /**
   * Handle payment failure
   * @param txRef - Transaction reference
   * @param error - Error message
   */
  handlePaymentFailure(txRef: string, error: string): void {
    console.error('Payment failed:', { txRef, error });
    
    // You can emit an event or update global state here
    window.dispatchEvent(new CustomEvent('paymentFailure', {
      detail: { txRef, error }
    }));
  }
}

// Export singleton instance
export const chapaPaymentService = new ChapaPaymentService();
export default chapaPaymentService;
