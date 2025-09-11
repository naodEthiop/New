export type Language = 'en' | 'am';

export interface LanguageStrings {
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  back: string;
  next: string;
  continue: string;
  getStarted: string;
  save: string;
  delete: string;
  edit: string;
  close: string;
  
  // Navigation
  home: string;
  games: string;
  profile: string;
  settings: string;
  wallet: string;
  leaderboard: string;
  shop: string;
  support: string;
  
  // Auth
  signIn: string;
  signUp: string;
  signOut: string;
  continueWithGoogle: string;
  phoneRegistration: string;
  sharePhoneNumber: string;
  phoneRegistered: string;
  welcomeToBingo: string;
  advancedGamingExperience: string;
  
  // Game
  gameModes: string;
  classicBingo: string;
  speedBingo: string;
  tournamentMode: string;
  practiceMode: string;
  dailyChallenge: string;
  joinGame: string;
  createGame: string;
  gameLobby: string;
  waitingForPlayers: string;
  players: string;
  entryFee: string;
  duration: string;
  difficulty: string;
  
  // User Profile
  level: string;
  experience: string;
  balance: string;
  gamesPlayed: string;
  gamesWon: string;
  achievements: string;
  totalEarnings: string;
  
  // Features
  realTime: string;
  multiplayer: string;
  achievementsSystem: string;
  customization: string;
  voiceChat: string;
  leaderboards: string;
  dailyChallenges: string;
  seasonalEvents: string;
  
  // Tutorial
  tutorial: string;
  tutorialWelcome: string;
  tutorialCreateGame: string;
  tutorialJoinGame: string;
  tutorialPlayGame: string;
  tutorialWallet: string;
  tutorialSettings: string;
  
  // Settings
  soundEnabled: string;
  musicEnabled: string;
  notificationsEnabled: string;
  language: string;
  theme: string;
  graphicsQuality: string;
  soundVolume: string;
  musicVolume: string;
  
  // Wallet
  deposit: string;
  withdraw: string;
  transfer: string;
  transactionHistory: string;
  recentActivity: string;
  
  // Achievements
  achievementUnlocked: string;
  firstVictory: string;
  speedDemon: string;
  tournamentChampion: string;
  socialButterfly: string;
  achievementCollector: string;
  
  // Errors
  errorOccurred: string;
  tryAgain: string;
  networkError: string;
  authenticationError: string;
  gameNotFound: string;
  insufficientBalance: string;
  
  // Success Messages
  phoneRegisteredSuccess: string;
  gameCreatedSuccess: string;
  gameJoinedSuccess: string;
  depositSuccess: string;
  withdrawalSuccess: string;
  transferSuccess: string;
  levelUp: string;
  signInSuccess: string;
  
  // Welcome Messages
  telegramWelcomeMessage: string;
  webWelcomeMessage: string;
  playGames: string;
  earnRewards: string;
  
  // Bot Messages
  botWelcome: string;
  botHelp: string;
  botCommands: string;
  botStart: string;
  botStats: string;
  botBalance: string;
  botGames: string;
}

export const translations: Record<Language, LanguageStrings> = {
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    getStarted: 'Get Started',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    
    // Navigation
    home: 'Home',
    games: 'Games',
    profile: 'Profile',
    settings: 'Settings',
    wallet: 'Wallet',
    leaderboard: 'Leaderboard',
    shop: 'Shop',
    support: 'Support',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    continueWithGoogle: 'Continue with Google',
    phoneRegistration: 'Phone Registration',
    sharePhoneNumber: 'Share Phone Number',
    phoneRegistered: 'Phone Registered',
    welcomeToBingo: 'Welcome to Bingo Platform',
    advancedGamingExperience: 'Advanced Gaming Experience',
    
    // Game
    gameModes: 'Game Modes',
    classicBingo: 'Classic Bingo',
    speedBingo: 'Speed Bingo',
    tournamentMode: 'Tournament Mode',
    practiceMode: 'Practice Mode',
    dailyChallenge: 'Daily Challenge',
    joinGame: 'Join Game',
    createGame: 'Create Game',
    gameLobby: 'Game Lobby',
    waitingForPlayers: 'Waiting for players...',
    players: 'players',
    entryFee: 'Entry Fee',
    duration: 'Duration',
    difficulty: 'Difficulty',
    
    // User Profile
    level: 'Level',
    experience: 'Experience',
    balance: 'Balance',
    gamesPlayed: 'Games Played',
    gamesWon: 'Games Won',
    achievements: 'Achievements',
    totalEarnings: 'Total Earnings',
    
    // Features
    realTime: 'Real-time',
    multiplayer: 'Multiplayer',
    achievementsSystem: 'Achievements',
    customization: 'Customization',
    voiceChat: 'Voice Chat',
    leaderboards: 'Leaderboards',
    dailyChallenges: 'Daily Challenges',
    seasonalEvents: 'Seasonal Events',
    
    // Tutorial
    tutorial: 'Tutorial',
    tutorialWelcome: 'Welcome to Bingo Platform!',
    tutorialCreateGame: 'Learn how to create games',
    tutorialJoinGame: 'Learn how to join games',
    tutorialPlayGame: 'Learn how to play Bingo',
    tutorialWallet: 'Learn about your wallet',
    tutorialSettings: 'Customize your experience',
    
    // Settings
    soundEnabled: 'Sound Enabled',
    musicEnabled: 'Music Enabled',
    notificationsEnabled: 'Notifications Enabled',
    language: 'Language',
    theme: 'Theme',
    graphicsQuality: 'Graphics Quality',
    soundVolume: 'Sound Volume',
    musicVolume: 'Music Volume',
    
    // Wallet
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    transfer: 'Transfer',
    transactionHistory: 'Transaction History',
    recentActivity: 'Recent Activity',
    
    // Achievements
    achievementUnlocked: 'Achievement Unlocked',
    firstVictory: 'First Victory',
    speedDemon: 'Speed Demon',
    tournamentChampion: 'Tournament Champion',
    socialButterfly: 'Social Butterfly',
    achievementCollector: 'Achievement Collector',
    
    // Errors
    errorOccurred: 'An error occurred',
    tryAgain: 'Please try again',
    networkError: 'Network error',
    authenticationError: 'Authentication error',
    gameNotFound: 'Game not found',
    insufficientBalance: 'Insufficient balance',
    
    // Success Messages
    phoneRegisteredSuccess: 'Phone number registered successfully!',
    gameCreatedSuccess: 'Game created successfully!',
    gameJoinedSuccess: 'Joined game successfully!',
    depositSuccess: 'Deposit successful!',
    withdrawalSuccess: 'Withdrawal successful!',
    transferSuccess: 'Transfer successful!',
    levelUp: 'Level Up!',
    signInSuccess: 'Sign in successful!',
    
    // Welcome Messages
    telegramWelcomeMessage: 'Welcome to Bingo Bot! 🎮',
    webWelcomeMessage: 'Welcome to Bingo Bot! 🎮',
    playGames: 'Play Games',
    earnRewards: 'Earn Rewards',
    
    // Bot Messages
    botWelcome: 'Welcome to Bingo Bot! 🎮',
    botHelp: 'Need help? Use /help for commands',
    botCommands: 'Available commands: /start, /stats, /balance, /games',
    botStart: 'Starting your Bingo adventure...',
    botStats: 'Your game statistics',
    botBalance: 'Your current balance',
    botGames: 'Available games'
  },
  
  am: {
    // Common
    loading: 'በመጫን ላይ...',
    error: 'ስህተት',
    success: 'ተሳክቷል',
    cancel: 'ሰርዝ',
    confirm: 'ያረጋግጥ',
    back: 'ተመለስ',
    next: 'ቀጣይ',
    continue: 'ቀጥል',
    getStarted: 'ጀምር',
    save: 'አስቀምጥ',
    delete: 'ሰርዝ',
    edit: 'አርትዕ',
    close: 'ዝጋ',
    
    // Navigation
    home: 'የመነሻ ገጽ',
    games: 'ጨዋታዎች',
    profile: 'መገለጫ',
    settings: 'ቅንብሮች',
    wallet: 'የገንዘብ ቦርሳ',
    leaderboard: 'የመሪዎች ዝርዝር',
    shop: 'ድህረ ገጽ',
    support: 'ድጋፍ',
    
    // Auth
    signIn: 'ግባ',
    signUp: 'ይመዝገቡ',
    signOut: 'ውጣ',
    continueWithGoogle: 'በ Google ይቀጥሉ',
    phoneRegistration: 'የስልክ ምዝገባ',
    sharePhoneNumber: 'የስልክ ቁጥር ያጋራ',
    phoneRegistered: 'የስልክ ቁጥር ተመዝግቧል',
    welcomeToBingo: 'ወደ ቢንጎ መድረክ እንኳን በደህና መጡ',
    advancedGamingExperience: 'የላቀ የጨዋታ ልምድ',
    
    // Game
    gameModes: 'የጨዋታ ሁኔታዎች',
    classicBingo: 'ክላሲክ ቢንጎ',
    speedBingo: 'ፍጥነት ቢንጎ',
    tournamentMode: 'የውድድር ሁኔታ',
    practiceMode: 'የስልጠና ሁኔታ',
    dailyChallenge: 'የዕለት ተዕለት ፈተና',
    joinGame: 'ጨዋታ ላይ ተቀላቀል',
    createGame: 'ጨዋታ ፍጠር',
    gameLobby: 'የጨዋታ አዳራሽ',
    waitingForPlayers: 'ተጫዋቾችን በመጠበቅ ላይ...',
    players: 'ተጫዋቾች',
    entryFee: 'የመግቢያ ክፍያ',
    duration: 'ጊዜ',
    difficulty: 'አስቸጋሪነት',
    
    // User Profile
    level: 'ደረጃ',
    experience: 'ልምድ',
    balance: 'ቀሪ',
    gamesPlayed: 'የተጫወቱ ጨዋታዎች',
    gamesWon: 'የወጡ ጨዋታዎች',
    achievements: 'ውጤቶች',
    totalEarnings: 'ጠቅላላ ገቢ',
    
    // Features
    realTime: 'በቅጽበት',
    multiplayer: 'በብዙ ሰዎች',
    achievementsSystem: 'ውጤቶች',
    customization: 'ማስተካከያ',
    voiceChat: 'የድምፅ ውይይት',
    leaderboards: 'የመሪዎች ዝርዝሮች',
    dailyChallenges: 'የዕለት ተዕለት ፈተናዎች',
    seasonalEvents: 'የወቅት ዝግጅቶች',
    
    // Tutorial
    tutorial: 'ስልጠና',
    tutorialWelcome: 'ወደ ቢንጎ መድረኳ እንኳን በደህና መጡ!',
    tutorialCreateGame: 'ጨዋታዎችን እንዴት እንደሚፈጥሩ ይማሩ',
    tutorialJoinGame: 'ጨዋታዎችን እንደሚቀላቀሉ ይማሩ',
    tutorialPlayGame: 'ቢንጎ እንደሚጫወቱ ይማሩ',
    tutorialWallet: 'ስለ የገንዘብ ቦርሳዎ ይማሩ',
    tutorialSettings: 'ልምድዎን ያስተካክሉ',
    
    // Settings
    soundEnabled: 'ድምፅ የተነቃ',
    musicEnabled: 'ሙዚቃ የተነቃ',
    notificationsEnabled: 'ማስታወቂያዎች የተነቁ',
    language: 'ቋንቋ',
    theme: 'ገጽታ',
    graphicsQuality: 'የግራፊክ ጥራት',
    soundVolume: 'የድምፅ መጠን',
    musicVolume: 'የሙዚቃ መጠን',
    
    // Wallet
    deposit: 'ያስገቡ',
    withdraw: 'ያውጡ',
    transfer: 'ያስተላልፉ',
    transactionHistory: 'የግብይት ታሪክ',
    recentActivity: 'የቅርብ ጊዜ እንቅስቃሴ',
    
    // Achievements
    achievementUnlocked: 'ውጤት ተከፍቷል',
    firstVictory: 'የመጀመሪያ ድል',
    speedDemon: 'የፍጥነት ዲሞን',
    tournamentChampion: 'የውድድር ቻምፒዮን',
    socialButterfly: 'የማህበራዊ ቢፈለጌ',
    achievementCollector: 'የውጤት ሰብሳቢ',
    
    // Errors
    errorOccurred: 'ስህተት ተከስቷል',
    tryAgain: 'እባክዎ እንደገና ይሞክሩ',
    networkError: 'የድረ-ገጽ ስህተት',
    authenticationError: 'የማረጋገጫ ስህተት',
    gameNotFound: 'ጨዋታ አልተገኘም',
    insufficientBalance: 'ቂም ያልሆነ ቀሪ',
    
    // Success Messages
    phoneRegisteredSuccess: 'የስልክ ቁጥር በተሳካም ሁኔታ ተመዝግቧል!',
    gameCreatedSuccess: 'ጨዋታ በተሳካም ሁኔታ ተፈጥሯል!',
    gameJoinedSuccess: 'ጨዋታ ላይ በተሳካም ሁኔታ ተቀላቅሏል!',
    depositSuccess: 'ግብይቱ ተሳክቷል!',
    withdrawalSuccess: 'ውጣቱ ተሳክቷል!',
    transferSuccess: 'ማስተላለፊያው ተሳክቷል!',
    levelUp: 'ደረጃ ጨመረ!',
    signInSuccess: 'ግባ በተሳካም ሁኔታ ተፈጥሯል!',
    
    // Welcome Messages
    telegramWelcomeMessage: 'ወደ ቢንጎ ቦት እንኳን በደህና መጡ! 🎮',
    webWelcomeMessage: 'ወደ ቢንጎ ቦት እንኳን በደህና መጡ! 🎮',
    playGames: 'ጨዋታዎች ይመልከቱ',
    earnRewards: 'ገቢ ይመልከቱ',
    
    // Bot Messages
    botWelcome: 'ወደ ቢንጎ ቦት እንኳን በደህና መጡ! 🎮',
    botHelp: 'ድጋፍ ይፈልጋሉ? ለትዕዛዞች /help ይጠቀሙ',
    botCommands: 'የሚገኙ ትዕዛዞች: /start, /stats, /balance, /games',
    botStart: 'የቢንጎ ወጣት አደራጃችሁ እያለ...',
    botStats: 'የጨዋታ ስታትስቲክስዎ',
    botBalance: 'የአሁኑ ቀሪዎ',
    botGames: 'የሚገኙ ጨዋታዎች'
  }
};

// Language management
class LanguageManager {
  private currentLanguage: Language = 'en';

  constructor() {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'am')) {
      this.currentLanguage = savedLanguage;
    } else {
      // Auto-detect language based on browser
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('am')) {
        this.currentLanguage = 'am';
      }
    }
    
    this.applyLanguage();
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    this.applyLanguage();
  }

  t(key: keyof LanguageStrings): string {
    return translations[this.currentLanguage][key] || key;
  }

  private applyLanguage(): void {
    // Apply language-specific CSS
    document.documentElement.setAttribute('lang', this.currentLanguage);
    document.documentElement.setAttribute('data-language', this.currentLanguage);
    
    // Apply Amharic font if needed
    if (this.currentLanguage === 'am') {
      document.documentElement.classList.add('amharic-font');
    } else {
      document.documentElement.classList.remove('amharic-font');
    }
  }
}

export const languageManager = new LanguageManager();

// Helper function for translations
export const t = (key: keyof LanguageStrings): string => {
  return languageManager.t(key);
}; 