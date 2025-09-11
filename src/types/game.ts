export interface Player {
  id: string;
  name: string;
  email: string;
  telegramId?: string;
  avatar?: string;
  isOnline: boolean;
  dailyStreak?: number;
  lastPlayDate?: string;
  totalPoints?: number;
  level?: number;
  experience?: number;
  // Enhanced player profile
  displayName?: string;
  bio?: string;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    telegram: boolean;
  };
  preferences?: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    voiceEnabled: boolean;
    autoMark: boolean;
    showTimer: boolean;
  };
  // Currency and rewards
  coins: number;
  gems: number;
  premiumCurrency: number;
  // Social features
  friends: string[];
  blockedUsers: string[];
  // Game statistics
  totalGamesPlayed: number;
  totalGamesWon: number;
  totalWinnings: number;
  bestWin: number;
  averageGameTime: number;
  // Achievements and badges
  achievements: Achievement[];
  badges: Badge[];
  // Tournament stats
  tournamentWins: number;
  tournamentParticipations: number;
  // Daily rewards
  lastDailyReward?: string;
  dailyRewardStreak: number;
  maxDailyStreak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  reward?: {
    type: 'coins' | 'gems' | 'experience';
    amount: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'free_space' | 'double_points' | 'skip_number' | 'extra_time' | 'hint' | 'auto_mark';
  cost: number;
  currency: 'coins' | 'gems';
  duration?: number; // in seconds
  effect: {
    type: string;
    value: number;
  };
  isActive: boolean;
  expiresAt?: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  entryFee: number;
  maxPlayers: number;
  currentPlayers: number;
  prizePool: number;
  status: 'upcoming' | 'active' | 'completed';
  type: 'elimination' | 'points' | 'survival';
  rounds: TournamentRound[];
  leaderboard: TournamentPlayer[];
  rewards: TournamentReward[];
  rules: string[];
}

export interface TournamentRound {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  games: string[]; // Game IDs
  status: 'pending' | 'active' | 'completed';
}

export interface TournamentPlayer {
  playerId: string;
  playerName: string;
  avatar: string;
  points: number;
  gamesWon: number;
  gamesPlayed: number;
  rank: number;
  eliminated: boolean;
}

export interface TournamentReward {
  rank: number;
  coins: number;
  gems: number;
  experience: number;
  badge?: string;
}

export interface Leaderboard {
  id: string;
  type: 'global' | 'weekly' | 'monthly' | 'tournament';
  period: string;
  players: LeaderboardPlayer[];
  lastUpdated: string;
}

export interface LeaderboardPlayer {
  playerId: string;
  playerName: string;
  avatar: string;
  score: number;
  rank: number;
  change: number; // rank change from previous period
}

export interface BingoSquare {
  number: number;
  marked: boolean;
  called: boolean;
  powerUp?: PowerUp;
}

export interface BingoCard {
  id: string;
  playerId: string;
  B: BingoSquare[];
  I: BingoSquare[];
  N: BingoSquare[];
  G: BingoSquare[];
  O: BingoSquare[];
  powerUps: PowerUp[];
  patterns: BingoPattern[];
}

export interface BingoPattern {
  id: string;
  name: string;
  description: string;
  pattern: boolean[][];
  reward: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface BonusSystem {
  enabled: boolean;
  amount: number;
  type: 'percentage' | 'fixed';
  conditions: string[];
}

export interface InvitationSystem {
  enabled: boolean;
  code: string;
  maxUses: number;
  currentUses: number;
  expiresAt?: string;
  reward?: {
    type: 'coins' | 'gems';
    amount: number;
  };
}

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  entryFee: number;
  prizePool: number;
  status: 'waiting' | 'starting' | 'playing' | 'completed';
  calledNumbers: number[];
  currentCall: number | null;
  createdAt: Date | any;
  gameStartedAt?: Date | any;
  gameEndedAt?: Date | any;
  lastCallTime?: Date | any;
  numberCallInterval?: number; // milliseconds between number calls
  telegramBotEnabled?: boolean;
  telegramChannelId?: string;
  winnerId?: string;
  winPattern?: string;
  winAmount?: number;
  bonusSystem?: BonusSystem;
  invitationSystem?: InvitationSystem;
  scheduledTime?: Date; // Scheduled start time for the game
  // Enhanced game features
  gameMode: 'classic' | 'speed' | 'pattern' | 'tournament';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in seconds
  powerUpsEnabled: boolean;
  chatEnabled: boolean;
  voiceEnabled: boolean;
  // Tournament specific
  tournamentId?: string;
  roundNumber?: number;
  // Game settings
  autoCallNumbers: boolean;
  callInterval: number; // seconds between calls
  maxNumbers: number; // 75 for 75-ball bingo
  patterns: BingoPattern[];
  // Chat and social
  chatMessages: ChatMessage[];
  // Power-ups in game
  activePowerUps: PowerUp[];
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  message: string;
  timestamp: string;
  type: 'text' | 'system' | 'emote';
  isDeleted: boolean;
}

export interface Payment {
  id: string;
  playerId: string;
  gameRoomId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  chapaReference: string;
  createdAt: Date;
  completedAt?: Date;
  // Enhanced payment info
  type: 'deposit' | 'withdrawal' | 'game_entry' | 'tournament_entry' | 'power_up';
  description: string;
  fee: number;
  netAmount: number;
  paymentMethod: 'chapa' | 'telegram' | 'wallet';
  metadata?: Record<string, any>;
}

export interface DailyBonusSystem {
  enabled: boolean;
  streakDays: number;
  bonusPoints: number;
  maxStreak: number;
  rewards: DailyReward[];
  lastClaimed?: string;
  currentStreak: number;
}

export interface DailyReward {
  day: number;
  coins: number;
  gems: number;
  experience: number;
  powerUp?: PowerUp;
  isClaimed: boolean;
}

export interface PlayerStats {
  userId: string;
  gamesPlayed: number;
  gamesWon: number;
  totalWinnings: number;
  currentStreak: number;
  longestStreak: number;
  dailyStreak: number;
  lastPlayDate: string;
  totalPoints: number;
  level: number;
  experience: number;
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
  // Enhanced statistics
  averageGameTime: number;
  fastestWin: number;
  totalNumbersCalled: number;
  perfectGames: number; // Games won without using power-ups
  tournamentStats: {
    participations: number;
    wins: number;
    totalPrizeMoney: number;
  };
  weeklyStats: {
    gamesPlayed: number;
    gamesWon: number;
    winnings: number;
    points: number;
  };
  monthlyStats: {
    gamesPlayed: number;
    gamesWon: number;
    winnings: number;
    points: number;
  };
}

export interface InvitationCode {
  id: string;
  code: string;
  createdBy: string;
  gameId?: string;
  maxUses: number;
  currentUses: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  // Enhanced invitation
  reward?: {
    type: 'coins' | 'gems' | 'power_up';
    amount: number;
  };
  usedBy: string[];
}

export interface GameSettings {
  id: string;
  userId: string;
  // Audio settings
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  // Visual settings
  theme: 'light' | 'dark' | 'auto';
  animations: boolean;
  particleEffects: boolean;
  colorBlindMode: boolean;
  // Gameplay settings
  autoMark: boolean;
  showTimer: boolean;
  showLeaderboard: boolean;
  confirmActions: boolean;
  // Notification settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  telegramNotifications: boolean;
  gameStartNotifications: boolean;
  tournamentNotifications: boolean;
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  // Performance
  lowPowerMode: boolean;
  dataSaver: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'game_invite' | 'tournament_start' | 'achievement' | 'daily_reward' | 'payment' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface GameHistory {
  id: string;
  gameId: string;
  playerId: string;
  gameName: string;
  startTime: string;
  endTime: string;
  duration: number;
  result: 'win' | 'loss' | 'draw';
  winnings: number;
  entryFee: number;
  calledNumbers: number[];
  patternsCompleted: string[];
  powerUpsUsed: string[];
  finalScore: number;
  rank?: number;
  totalPlayers: number;
  tournamentId?: string;
  replayData?: any;
}