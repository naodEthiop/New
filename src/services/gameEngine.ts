import { GAME_CONFIG } from '../firebase/config';

// Browser-compatible EventEmitter
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }

  off(event: string, listener: Function): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Unity/Unreal-inspired Game Engine
export interface GameMode {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  entryFee: number; // Entry fee in ETB
  rewards: {
    experience: number;
    coins: number;
    achievements: string[];
  };
  features: string[];
  icon: string;
}

export interface GameState {
  currentScene: string;
  currentGameMode: string | null;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  level: number;
  experience: number;
  achievements: string[];
  settings: {
    soundVolume: number;
    musicVolume: number;
    graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'social' | 'collection' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface GameScene {
  id: string;
  name: string;
  background: string;
  music: string;
  ambientSounds: string[];
  lighting: 'day' | 'night' | 'dynamic';
  weather: 'clear' | 'rain' | 'snow' | 'storm';
  particles: boolean;
  animations: boolean;
}

class GameEngine extends EventEmitter {
  private gameState: GameState;
  private gameModes: GameMode[];
  private achievements: Achievement[];
  private scenes: GameScene[];
  private isInitialized: boolean = false;
  private gameLoop: number | null = null;
  private lastFrameTime: number = 0;

  constructor() {
    super();
    
    this.gameState = {
      currentScene: GAME_CONFIG.SCENES.SPLASH,
      currentGameMode: null,
      isPaused: false,
      isGameOver: false,
      score: 0,
      level: 1,
      experience: 0,
      achievements: [],
      settings: {
        soundVolume: 0.7,
        musicVolume: 0.5,
        graphicsQuality: 'high',
        language: 'en',
        theme: 'auto'
      }
    };

    this.gameModes = [
      {
        id: 'classic',
        name: 'Classic Bingo',
        description: 'Traditional 5x5 Bingo with classic rules',
        minPlayers: 2,
        maxPlayers: 50,
        duration: 10,
        difficulty: 'easy',
        entryFee: 10,
        rewards: {
          experience: 100,
          coins: 50,
          achievements: ['first_win', 'classic_master']
        },
        features: ['voice_announcements', 'auto_daub', 'chat'],
        icon: '🎯'
      },
      {
        id: 'speed',
        name: 'Speed Bingo',
        description: 'Fast-paced Bingo with time pressure',
        minPlayers: 2,
        maxPlayers: 20,
        duration: 5,
        difficulty: 'medium',
        entryFee: 20,
        rewards: {
          experience: 150,
          coins: 75,
          achievements: ['speed_demon', 'quick_winner']
        },
        features: ['timer', 'power_ups', 'combo_system'],
        icon: '⚡'
      },
      {
        id: 'tournament',
        name: 'Tournament Mode',
        description: 'Competitive tournament with brackets',
        minPlayers: 8,
        maxPlayers: 64,
        duration: 30,
        difficulty: 'hard',
        entryFee: 50,
        rewards: {
          experience: 300,
          coins: 200,
          achievements: ['tournament_champion', 'bracket_master']
        },
        features: ['brackets', 'elimination', 'leaderboards'],
        icon: '🏆'
      },
      {
        id: 'practice',
        name: 'Practice Mode',
        description: 'Learn and practice without pressure',
        minPlayers: 1,
        maxPlayers: 1,
        duration: 15,
        difficulty: 'easy',
        entryFee: 5,
        rewards: {
          experience: 50,
          coins: 25,
          achievements: ['practice_master']
        },
        features: ['hints', 'undo', 'tutorial'],
        icon: '📚'
      },
      {
        id: 'challenge',
        name: 'Daily Challenge',
        description: 'Unique daily challenges with special rules',
        minPlayers: 2,
        maxPlayers: 30,
        duration: 20,
        difficulty: 'expert',
        entryFee: 10,
        rewards: {
          experience: 250,
          coins: 150,
          achievements: ['challenge_complete', 'daily_streak']
        },
        features: ['special_rules', 'daily_reset', 'unique_rewards'],
        icon: '🎲'
      }
    ];

    this.achievements = [
      {
        id: 'first_win',
        name: 'First Victory',
        description: 'Win your first Bingo game',
        icon: '🥇',
        category: 'gameplay',
        rarity: 'common',
        points: 10,
        unlocked: false
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Win a Speed Bingo game in under 3 minutes',
        icon: '⚡',
        category: 'gameplay',
        rarity: 'rare',
        points: 25,
        unlocked: false
      },
      {
        id: 'tournament_champion',
        name: 'Tournament Champion',
        description: 'Win a tournament with 16+ players',
        icon: '👑',
        category: 'gameplay',
        rarity: 'epic',
        points: 100,
        unlocked: false
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Play games with 50 different players',
        icon: '🦋',
        category: 'social',
        rarity: 'rare',
        points: 50,
        unlocked: false,
        progress: 0,
        maxProgress: 50
      },
      {
        id: 'collector',
        name: 'Achievement Collector',
        description: 'Unlock 25 achievements',
        icon: '🏆',
        category: 'collection',
        rarity: 'epic',
        points: 75,
        unlocked: false,
        progress: 0,
        maxProgress: 25
      }
    ];

    this.scenes = [
      {
        id: 'splash',
        name: 'Splash Screen',
        background: 'gradient-purple-blue',
        music: 'ambient_loading',
        ambientSounds: ['soft_wind'],
        lighting: 'dynamic',
        weather: 'clear',
        particles: true,
        animations: true
      },
      {
        id: 'main_menu',
        name: 'Main Menu',
        background: 'gradient-blue-indigo',
        music: 'menu_theme',
        ambientSounds: ['menu_ambience'],
        lighting: 'day',
        weather: 'clear',
        particles: true,
        animations: true
      },
      {
        id: 'game_lobby',
        name: 'Game Lobby',
        background: 'gradient-green-blue',
        music: 'lobby_theme',
        ambientSounds: ['crowd_chatter'],
        lighting: 'dynamic',
        weather: 'clear',
        particles: false,
        animations: true
      },
      {
        id: 'game_room',
        name: 'Game Room',
        background: 'gradient-orange-red',
        music: 'game_theme',
        ambientSounds: ['game_ambience'],
        lighting: 'dynamic',
        weather: 'clear',
        particles: true,
        animations: true
      }
    ];
  }

  // Unity/Unreal-style initialization
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🎮 Initializing Game Engine...');
      
      // Load game assets
      await this.loadAssets();
      
      // Initialize audio system
      await this.initializeAudio();
      
      // Setup game loop
      this.setupGameLoop();
      
      // Load saved game state
      this.loadGameState();
      
      this.isInitialized = true;
      console.log('✅ Game Engine initialized successfully');
      
      this.emit('engine:initialized');
    } catch (error) {
      console.error('❌ Game Engine initialization failed:', error);
      throw error;
    }
  }

  private async loadAssets(): Promise<void> {
    // Simulate asset loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('📦 Assets loaded');
  }

  private async initializeAudio(): Promise<void> {
    if (typeof window !== 'undefined' && window.AudioContext) {
      // Only log initialization
      console.log('🔊 Audio system initialized');
    }
  }

  private setupGameLoop(): void {
    const gameLoop = (currentTime: number) => {
      if (!this.gameState.isPaused) {
        const deltaTime = currentTime - this.lastFrameTime;
        this.update(deltaTime);
        this.render();
      }
      
      this.lastFrameTime = currentTime;
      this.gameLoop = requestAnimationFrame(gameLoop);
    };
    
    this.gameLoop = requestAnimationFrame(gameLoop);
  }

  private update(deltaTime: number): void {
    // Update game logic
    this.emit('engine:update', deltaTime);
  }

  private render(): void {
    // Render game state
    this.emit('engine:render');
  }

  // Scene Management (Unity/Unreal style)
  async loadScene(sceneId: string): Promise<void> {
    const scene = this.scenes.find(s => s.id === sceneId);
    if (!scene) {
      throw new Error(`Scene '${sceneId}' not found`);
    }

    console.log(`🎬 Loading scene: ${scene.name}`);
    
    // Scene transition effect
    this.emit('scene:transition:start', sceneId);
    
    // Load scene assets
    await this.loadSceneAssets(scene);
    
    // Update game state
    this.gameState.currentScene = sceneId;
    
    // Apply scene settings
    this.applySceneSettings(scene);
    
    // Emit scene loaded event
    this.emit('scene:loaded', scene);
    
    console.log(`✅ Scene loaded: ${scene.name}`);
  }

  private async loadSceneAssets(_scene: GameScene): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private applySceneSettings(scene: GameScene): void {
    // Apply lighting
    document.documentElement.setAttribute('data-lighting', scene.lighting);
    
    // Apply weather effects
    document.documentElement.setAttribute('data-weather', scene.weather);
    
    // Toggle particles
    document.documentElement.setAttribute('data-particles', scene.particles.toString());
    
    // Toggle animations
    document.documentElement.setAttribute('data-animations', scene.animations.toString());
  }

  // Game Mode Management
  getGameModes(): GameMode[] {
    return this.gameModes;
  }

  getGameMode(modeId: string): GameMode | undefined {
    return this.gameModes.find(mode => mode.id === modeId);
  }

  async startGameMode(modeId: string): Promise<void> {
    const gameMode = this.getGameMode(modeId);
    if (!gameMode) {
      throw new Error(`Game mode '${modeId}' not found`);
    }

    console.log(`🎮 Starting game mode: ${gameMode.name}`);
    
    this.gameState.currentGameMode = modeId;
    this.gameState.isPaused = false;
    this.gameState.isGameOver = false;
    this.gameState.score = 0;
    
    this.emit('gamemode:started', gameMode);
  }

  // Achievement System
  getAchievements(): Achievement[] {
    return this.achievements;
  }

  async unlockAchievement(achievementId: string): Promise<void> {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    this.gameState.achievements.push(achievementId);
    
    console.log(`🏆 Achievement unlocked: ${achievement.name}`);
    
    // Show achievement notification
    this.emit('achievement:unlocked', achievement);
    
    // Save game state
    this.saveGameState();
  }

  async updateAchievementProgress(achievementId: string, progress: number): Promise<void> {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    if (achievement.progress !== undefined && achievement.maxProgress) {
      achievement.progress = Math.min(progress, achievement.maxProgress);
      
      if (achievement.progress >= achievement.maxProgress) {
        await this.unlockAchievement(achievementId);
      }
    }
  }

  // Game State Management
  getGameState(): GameState {
    return { ...this.gameState };
  }

  updateGameState(updates: Partial<GameState>): void {
    this.gameState = { ...this.gameState, ...updates };
    this.emit('gamestate:updated', this.gameState);
  }

  // Settings Management
  updateSettings(settings: Partial<GameState['settings']>): void {
    this.gameState.settings = { ...this.gameState.settings, ...settings };
    this.saveGameState();
    this.emit('settings:updated', this.gameState.settings);
  }

  // Save/Load System
  private saveGameState(): void {
    try {
      localStorage.setItem('bingo_game_state', JSON.stringify(this.gameState));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  private loadGameState(): void {
    try {
      const savedState = localStorage.getItem('bingo_game_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.gameState = { ...this.gameState, ...parsedState };
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
  }

  // Utility Methods
  pause(): void {
    this.gameState.isPaused = true;
    this.emit('game:paused');
  }

  resume(): void {
    this.gameState.isPaused = false;
    this.emit('game:resumed');
  }

  reset(): void {
    this.gameState.score = 0;
    this.gameState.isGameOver = false;
    this.gameState.currentGameMode = null;
    this.emit('game:reset');
  }

  // Cleanup
  destroy(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    this.removeAllListeners();
    console.log('🗑️ Game Engine destroyed');
  }

  // Audio methods
  getAudioContext(): AudioContext | null {
    return (window as any).gameAudioContext || null;
  }

  async playSound(soundName: string): Promise<void> {
    // In a real implementation, you would load and decode audio files
    // For now, we'll just log the sound name
    console.log(`🔊 Playing sound: ${soundName}`);
  }
}

// Export singleton instance
export const gameEngine = new GameEngine(); 