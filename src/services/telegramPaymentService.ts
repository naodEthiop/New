import { auth } from '../firebase/config';

export interface TelegramPaymentInvoice {
  title: string;
  description: string;
  payload: string;
  currency: string;
  prices: Array<{
    label: string;
    amount: number;
  }>;
  provider_token: string;
  start_parameter: string;
}

export interface TelegramPaymentResult {
  ok: boolean;
  result?: any;
  error_code?: number;
  description?: string;
}

class TelegramPaymentService {
  private botToken: string;
  private backendUrl: string;

  constructor() {
    this.botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  }

  private getApiUrl(method: string): string {
    return `https://api.telegram.org/bot${this.botToken}/${method}`;
  }

  /**
   * Create a payment invoice for wallet deposit
   */
  async createDepositInvoice(amount: number, chatId: string): Promise<TelegramPaymentResult> {
    try {
      const payload = `deposit|${amount}`;
      
      const response = await fetch(this.getApiUrl('sendInvoice'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          title: 'Bingo Wallet Deposit',
          description: `Deposit ${amount} ETB to your Bingo wallet`,
          payload: payload,
          provider_token: import.meta.env.VITE_TELEGRAM_PAYMENT_PROVIDER_TOKEN,
          currency: 'ETB',
          prices: [{
            label: 'Wallet Deposit',
            amount: Math.round(amount * 100) // Convert to cents
          }],
          start_parameter: `bingo_deposit_${Date.now()}`,
          need_name: true,
          need_phone_number: true,
          need_email: true,
          send_phone_number_to_provider: true,
          send_email_to_provider: true,
          is_flexible: false
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating deposit invoice:', error);
      return {
        ok: false,
        error_code: 500,
        description: 'Failed to create payment invoice'
      };
    }
  }

  /**
   * Create a payment invoice for game entry
   */
  async createGameEntryInvoice(gameId: string, gameName: string, entryFee: number, chatId: string): Promise<TelegramPaymentResult> {
    try {
      const payload = `game_entry|${gameId}|${entryFee}`;
      
      const response = await fetch(this.getApiUrl('sendInvoice'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          title: `Game Entry: ${gameName}`,
          description: `Entry fee for ${gameName}`,
          payload: payload,
          provider_token: import.meta.env.VITE_TELEGRAM_PAYMENT_PROVIDER_TOKEN,
          currency: 'ETB',
          prices: [{
            label: 'Game Entry Fee',
            amount: Math.round(entryFee * 100) // Convert to cents
          }],
          start_parameter: `bingo_game_${gameId}_${Date.now()}`,
          need_name: true,
          need_phone_number: true,
          need_email: true,
          send_phone_number_to_provider: true,
          send_email_to_provider: true,
          is_flexible: false
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating game entry invoice:', error);
      return {
        ok: false,
        error_code: 500,
        description: 'Failed to create payment invoice'
      };
    }
  }

  /**
   * Answer a pre-checkout query (approve/reject payment)
   */
  async answerPreCheckoutQuery(queryId: string, ok: boolean, errorMessage?: string): Promise<TelegramPaymentResult> {
    try {
      const payload: any = {
        pre_checkout_query_id: queryId,
        ok: ok
      };

      if (!ok && errorMessage) {
        payload.error_message = errorMessage;
      }

      const response = await fetch(this.getApiUrl('answerPreCheckoutQuery'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error answering pre-checkout query:', error);
      return {
        ok: false,
        error_code: 500,
        description: 'Failed to answer pre-checkout query'
      };
    }
  }

  /**
   * Send a message to a Telegram chat
   */
  async sendMessage(chatId: string, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<TelegramPaymentResult> {
    try {
      const response = await fetch(this.getApiUrl('sendMessage'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: parseMode
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return {
        ok: false,
        error_code: 500,
        description: 'Failed to send message'
      };
    }
  }

  /**
   * Get user's Telegram chat ID from Firebase
   */
  async getTelegramChatId(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const idToken = await user.getIdToken();
      
      const response = await fetch(`${this.backendUrl}/api/user/telegram-chat-id`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.chatId;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting Telegram chat ID:', error);
      return null;
    }
  }

  /**
   * Check if user has linked Telegram account
   */
  async hasLinkedTelegram(): Promise<boolean> {
    const chatId = await this.getTelegramChatId();
    return chatId !== null;
  }

  /**
   * Request deposit via Telegram
   */
  async requestDepositViaTelegram(amount: number): Promise<{ success: boolean; message: string }> {
    try {
      const chatId = await this.getTelegramChatId();
      if (!chatId) {
        return {
          success: false,
          message: 'Please link your Telegram account first to use Telegram payments.'
        };
      }

      const result = await this.createDepositInvoice(amount, chatId);
      
      if (result.ok) {
        return {
          success: true,
          message: `Payment invoice sent to your Telegram! Please check your Telegram messages and complete the payment of ${amount} ETB.`
        };
      } else {
        return {
          success: false,
          message: `Failed to create payment invoice: ${result.description || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Error requesting deposit via Telegram:', error);
      return {
        success: false,
        message: 'Failed to request deposit via Telegram. Please try again.'
      };
    }
  }

  /**
   * Request game entry payment via Telegram
   */
  async requestGameEntryViaTelegram(gameId: string, gameName: string, entryFee: number): Promise<{ success: boolean; message: string }> {
    try {
      const chatId = await this.getTelegramChatId();
      if (!chatId) {
        return {
          success: false,
          message: 'Please link your Telegram account first to use Telegram payments.'
        };
      }

      const result = await this.createGameEntryInvoice(gameId, gameName, entryFee, chatId);
      
      if (result.ok) {
        return {
          success: true,
          message: `Game entry payment invoice sent to your Telegram! Please check your Telegram messages and complete the payment of ${entryFee} ETB to join the game.`
        };
      } else {
        return {
          success: false,
          message: `Failed to create game entry invoice: ${result.description || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Error requesting game entry via Telegram:', error);
      return {
        success: false,
        message: 'Failed to request game entry via Telegram. Please try again.'
      };
    }
  }
}

export const telegramPaymentService = new TelegramPaymentService(); 