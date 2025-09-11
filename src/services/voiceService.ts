export interface VoiceSettings {
  enabled: boolean;
  language: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  numbers: { [key: number]: string };
  letters: { [key: string]: string };
  phrases: { [key: string]: string };
}

// Voice Service for Game Announcements and Number Calling
export class VoiceService {
  private static audioContext: AudioContext | null = null;
  private static sounds: Map<string, AudioBuffer> = new Map();
  private static isEnabled: boolean = true;
  private static volume: number = 0.7;

  // Initialize audio context
  static async initialize(): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  // Load sound files
  static async loadSound(name: string, url: string): Promise<void> {
    try {
      if (!this.audioContext) {
        await this.initialize();
      }

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound ${name}:`, error);
    }
  }

  // Play a sound
  static async playSound(name: string): Promise<void> {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      const sound = this.sounds.get(name);
      if (sound) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = sound;
        gainNode.gain.value = this.volume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start(0);
      }
    } catch (error) {
      console.error(`Failed to play sound ${name}:`, error);
    }
  }

  // Play number announcement
  static async announceNumber(number: number): Promise<void> {
    const numberStr = number.toString();
    
    // Play individual digit sounds
    for (let i = 0; i < numberStr.length; i++) {
      const digit = numberStr[i];
      await this.playSound(`digit_${digit}`);
      await this.delay(300); // Small delay between digits
    }
  }

  // Play game announcements
  static async playGameAnnouncement(type: 'game_start' | 'game_end' | 'winner' | 'bingo'): Promise<void> {
    await this.playSound(type);
  }

  // Play letter announcement (B, I, N, G, O)
  static async announceLetter(letter: string): Promise<void> {
    await this.playSound(`letter_${letter.toUpperCase()}`);
  }

  // Play full number call (e.g., "B-15")
  static async announceFullNumber(letter: string, number: number): Promise<void> {
    await this.announceLetter(letter);
    await this.delay(200);
    await this.announceNumber(number);
  }

  // Text-to-Speech for dynamic announcements
  static async speak(text: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.volume;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        // Try to use a gaming-friendly voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Samantha') || 
          voice.name.includes('Alex')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to speak text:', error);
    }
  }

  // Control methods
  static setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  static getVolume(): number {
    return this.volume;
  }

  static isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  // Utility method for delays
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Preload common sounds
  static async preloadCommonSounds(): Promise<void> {
    const sounds = [
      { name: 'game_start', url: '/sounds/game-start.mp3' },
      { name: 'game_end', url: '/sounds/game-end.mp3' },
      { name: 'winner', url: '/sounds/winner.mp3' },
      { name: 'bingo', url: '/sounds/bingo.mp3' },
      { name: 'letter_B', url: '/sounds/letter-b.mp3' },
      { name: 'letter_I', url: '/sounds/letter-i.mp3' },
      { name: 'letter_N', url: '/sounds/letter-n.mp3' },
      { name: 'letter_G', url: '/sounds/letter-g.mp3' },
      { name: 'letter_O', url: '/sounds/letter-o.mp3' },
      { name: 'digit_0', url: '/sounds/digit-0.mp3' },
      { name: 'digit_1', url: '/sounds/digit-1.mp3' },
      { name: 'digit_2', url: '/sounds/digit-2.mp3' },
      { name: 'digit_3', url: '/sounds/digit-3.mp3' },
      { name: 'digit_4', url: '/sounds/digit-4.mp3' },
      { name: 'digit_5', url: '/sounds/digit-5.mp3' },
      { name: 'digit_6', url: '/sounds/digit-6.mp3' },
      { name: 'digit_7', url: '/sounds/digit-7.mp3' },
      { name: 'digit_8', url: '/sounds/digit-8.mp3' },
      { name: 'digit_9', url: '/sounds/digit-9.mp3' },
    ];

    for (const sound of sounds) {
      try {
        await this.loadSound(sound.name, sound.url);
      } catch (error) {
        console.warn(`Could not load sound: ${sound.name}`);
      }
    }
  }
}