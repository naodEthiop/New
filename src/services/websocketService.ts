import { auth } from '../firebase/config';
import { ChatMessage, GameRoom, Player } from '../types/game';

/**
 * WebSocket Service for Real-time Multiplayer Features
 * Handles live chat, game updates, and real-time interactions
 */
export interface WebSocketMessage {
  type: 'chat' | 'game_update' | 'player_join' | 'player_leave' | 'number_call' | 'game_start' | 'game_end' | 'power_up' | 'achievement' | 'system';
  data: any;
  timestamp: string;
  senderId?: string;
  senderName?: string;
}

export interface ChatMessageData {
  message: string;
  gameId: string;
  type: 'text' | 'system' | 'emote';
}

export interface GameUpdateData {
  gameId: string;
  updateType: 'number_call' | 'player_join' | 'player_leave' | 'game_start' | 'game_end' | 'power_up_used' | 'pattern_complete';
  data: any;
}

export interface PlayerActionData {
  playerId: string;
  playerName: string;
  action: 'join' | 'leave' | 'ready' | 'use_power_up' | 'mark_number';
  gameId: string;
  data?: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: WebSocketMessage[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private currentGameId: string | null = null;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Setup global event listeners for payment callbacks
   */
  private setupEventListeners(): void {
    window.addEventListener('paymentSuccess', (event: any) => {
      this.emit('payment_success', event.detail);
    });

    window.addEventListener('paymentFailure', (event: any) => {
      this.emit('payment_failure', event.detail);
    });
  }

  /**
   * Connect to WebSocket server
   * @param gameId - Current game ID
   */
  async connect(gameId?: string): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:5000/ws';
      const url = `${wsUrl}?token=${token}&gameId=${gameId || ''}`;

      this.socket = new WebSocket(url);
      this.currentGameId = gameId || null;

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        this.emit('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.emit('disconnected', { code: event.code, reason: event.reason });

        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
    }
    this.isConnected = false;
    this.currentGameId = null;
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect(this.currentGameId || undefined);
    }, delay);
  }

  /**
   * Send message to WebSocket server
   * @param message - Message to send
   */
  send(message: WebSocketMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      // Queue message for later if not connected
      this.messageQueue.push(message);
    }
  }

  /**
   * Flush queued messages when connection is restored
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  /**
   * Handle incoming WebSocket messages
   * @param message - Received message
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'chat':
        this.emit('chat_message', message.data);
        break;
      case 'game_update':
        this.emit('game_update', message.data);
        break;
      case 'player_join':
        this.emit('player_join', message.data);
        break;
      case 'player_leave':
        this.emit('player_leave', message.data);
        break;
      case 'number_call':
        this.emit('number_call', message.data);
        break;
      case 'game_start':
        this.emit('game_start', message.data);
        break;
      case 'game_end':
        this.emit('game_end', message.data);
        break;
      case 'power_up':
        this.emit('power_up_used', message.data);
        break;
      case 'achievement':
        this.emit('achievement_unlocked', message.data);
        break;
      case 'system':
        this.emit('system_message', message.data);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Join a game room
   * @param gameId - Game ID to join
   */
  joinGame(gameId: string): void {
    this.send({
      type: 'system',
      data: { action: 'join_game', gameId },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Leave a game room
   * @param gameId - Game ID to leave
   */
  leaveGame(gameId: string): void {
    this.send({
      type: 'system',
      data: { action: 'leave_game', gameId },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send a chat message
   * @param message - Chat message data
   */
  sendChatMessage(message: ChatMessageData): void {
    this.send({
      type: 'chat',
      data: message,
      timestamp: new Date().toISOString(),
      senderId: auth.currentUser?.uid,
      senderName: auth.currentUser?.displayName || 'Player'
    });
  }

  /**
   * Mark a number on the bingo card
   * @param gameId - Game ID
   * @param number - Number to mark
   * @param position - Position on the card
   */
  markNumber(gameId: string, number: number, position: { row: number; col: number }): void {
    this.send({
      type: 'system',
      data: {
        action: 'mark_number',
        gameId,
        number,
        position
      },
      timestamp: new Date().toISOString(),
      senderId: auth.currentUser?.uid
    });
  }

  /**
   * Use a power-up
   * @param gameId - Game ID
   * @param powerUpId - Power-up ID
   */
  usePowerUp(gameId: string, powerUpId: string): void {
    this.send({
      type: 'system',
      data: {
        action: 'use_power_up',
        gameId,
        powerUpId
      },
      timestamp: new Date().toISOString(),
      senderId: auth.currentUser?.uid
    });
  }

  /**
   * Send player action
   * @param action - Player action data
   */
  sendPlayerAction(action: PlayerActionData): void {
    this.send({
      type: 'system',
      data: action,
      timestamp: new Date().toISOString(),
      senderId: auth.currentUser?.uid
    });
  }

  /**
   * Subscribe to an event
   * @param event - Event name
   * @param callback - Callback function
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribe from an event
   * @param event - Event name
   * @param callback - Callback function to remove
   */
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all listeners
   * @param event - Event name
   * @param data - Event data
   */
  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get current game ID
   */
  getCurrentGameId(): string | null {
    return this.currentGameId;
  }

  /**
   * Ping the server to check connection
   */
  ping(): void {
    this.send({
      type: 'system',
      data: { action: 'ping' },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Request game state update
   * @param gameId - Game ID
   */
  requestGameState(gameId: string): void {
    this.send({
      type: 'system',
      data: { action: 'get_game_state', gameId },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send player ready status
   * @param gameId - Game ID
   * @param isReady - Ready status
   */
  sendReadyStatus(gameId: string, isReady: boolean): void {
    this.send({
      type: 'system',
      data: { action: 'player_ready', gameId, isReady },
      timestamp: new Date().toISOString(),
      senderId: auth.currentUser?.uid
    });
  }

  /**
   * Request player list for a game
   * @param gameId - Game ID
   */
  requestPlayerList(gameId: string): void {
    this.send({
      type: 'system',
      data: { action: 'get_players', gameId },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send emote in chat
   * @param gameId - Game ID
   * @param emote - Emote type
   */
  sendEmote(gameId: string, emote: string): void {
    this.sendChatMessage({
      message: emote,
      gameId,
      type: 'emote'
    });
  }

  /**
   * Report a player
   * @param gameId - Game ID
   * @param playerId - Player ID to report
   * @param reason - Report reason
   */
  reportPlayer(gameId: string, playerId: string, reason: string): void {
    this.send({
      type: 'system',
      data: {
        action: 'report_player',
        gameId,
        playerId,
        reason
      },
      timestamp: new Date().toISOString(),
      senderId: auth.currentUser?.uid
    });
  }

  /**
   * Block a player
   * @param playerId - Player ID to block
   */
  blockPlayer(playerId: string): void {
    this.send({
      type: 'system',
      data: {
        action: 'block_player',
        playerId
      },
      timestamp: new Date().toISOString(),
      senderId: auth.currentUser?.uid
    });
  }

  /**
   * Unblock a player
   * @param playerId - Player ID to unblock
   */
  unblockPlayer(playerId: string): void {
    this.send({
      type: 'system',
      data: {
        action: 'unblock_player',
        playerId
      },
      timestamp: new Date().toISOString(),
      senderId: auth.currentUser?.uid
    });
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
