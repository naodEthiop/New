import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Telegram Mini App Configuration
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          query_id: string;
          user: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
          };
          receiver: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
          chat: {
            id: number;
            type: string;
            title?: string;
            username?: string;
            photo_url?: string;
          };
          chat_type: string;
          chat_instance: string;
          start_param: string;
          can_send_after: number;
          auth_date: number;
          hash: string;
        };
        ready(): void;
        expand(): void;
        close(): void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
        };
        BackButton: {
          isVisible: boolean;
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
        };
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          link_color: string;
          button_color: string;
          button_text_color: string;
        };
        colorScheme: 'light' | 'dark';
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        setHeaderColor(color: string): void;
        setBackgroundColor(color: string): void;
        enableClosingConfirmation(): void;
        disableClosingConfirmation(): void;
        onEvent(eventType: string, eventHandler: (event: unknown) => void): void;
        offEvent(eventType: string, eventHandler: (event: unknown) => void): void;
        sendData(data: string): void;
        switchInlineQuery(query: string, choose_chat_types?: string[]): void;
        openLink(url: string, options?: { try_instant_view?: boolean }): void;
        openTelegramLink(url: string): void;
        openInvoice(url: string, callback?: (status: string) => void): void;
        showPopup(params: {
          title: string;
          message: string;
          buttons: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (buttonId: string) => void): void;
        showAlert(message: string, callback?: () => void): void;
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
        showScanQrPopup(params: { text?: string }, callback?: (data: string) => void): void;
        closeScanQrPopup(): void;
        readTextFromClipboard(callback?: (data: string) => void): void;
        requestWriteAccess(callback?: (access: boolean) => void): void;
        requestContact(callback?: (contact: unknown) => void): void;
        invokeCustomMethod(method: string, params?: unknown): void;
        version: string;
        platform: string;
        isVersionAtLeast(version: string): boolean;
        setViewport(viewport: unknown): void;
        delete(): void;
      };
    };
  }
}

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Basic runtime validation to surface misconfigured env vars early
const missingEnv = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missingEnv.length) {
  // eslint-disable-next-line no-console
  console.error('[Firebase] Missing environment variables:', missingEnv.join(', '));
}

export const isFirebaseConfigured = missingEnv.length === 0;

// Initialize Firebase (guard against HMR re-inits)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
// Ensure Firestore is initialized once (HMR-safe)
const globalAny = globalThis as unknown as { _db?: ReturnType<typeof initializeFirestore> };
if (!globalAny._db) {
  globalAny._db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false
  });
}
export const db = globalAny._db!;
export const storage = getStorage(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Telegram Mini App utilities
export const telegramWebApp = window.Telegram?.WebApp;

// Check if we're in Telegram Mini App environment
export const isTelegramWebApp = () => {
  return !!(
    window.Telegram?.WebApp &&
    window.Telegram.WebApp.initData &&
    window.Telegram.WebApp.initDataUnsafe?.user
  );
};

// Initialize Telegram Web App
if (telegramWebApp && isTelegramWebApp()) {
  telegramWebApp.ready();
  telegramWebApp.expand();
  
  // Set theme based on Telegram's theme
  const isDark = telegramWebApp.colorScheme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  
  // Apply Telegram theme colors
  const root = document.documentElement;
  root.style.setProperty('--tg-bg-color', telegramWebApp.themeParams.bg_color);
  root.style.setProperty('--tg-text-color', telegramWebApp.themeParams.text_color);
  root.style.setProperty('--tg-hint-color', telegramWebApp.themeParams.hint_color);
  root.style.setProperty('--tg-link-color', telegramWebApp.themeParams.link_color);
  root.style.setProperty('--tg-button-color', telegramWebApp.themeParams.button_color);
  root.style.setProperty('--tg-button-text-color', telegramWebApp.themeParams.button_text_color);
} else {
  console.log('Not running in Telegram Web App - using fallback mode');
}

// Telegram Bot API Configuration
export const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
export const TELEGRAM_BOT_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Game Platform Configuration
export const GAME_CONFIG = {
  // Unity-like game states
  GAME_STATES: {
    LOADING: 'loading',
    MENU: 'menu',
    LOBBY: 'lobby',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
  },
  
  // Unreal Engine-like game modes
  GAME_MODES: {
    CLASSIC: 'classic',
    SPEED: 'speed',
    TOURNAMENT: 'tournament',
    PRACTICE: 'practice',
    CHALLENGE: 'challenge'
  },
  
  // Godot-like scene management
  SCENES: {
    SPLASH: 'splash',
    MAIN_MENU: 'main_menu',
    GAME_LOBBY: 'game_lobby',
    GAME_ROOM: 'game_room',
    SETTINGS: 'settings',
    PROFILE: 'profile',
    SHOP: 'shop',
    LEADERBOARD: 'leaderboard'
  },
  
  // Custom engine features
  FEATURES: {
    ACHIEVEMENTS: true,
    LEADERBOARDS: true,
    DAILY_CHALLENGES: true,
    SEASONAL_EVENTS: true,
    SOCIAL_FEATURES: true,
    VOICE_CHAT: true,
    CUSTOMIZATION: true
  }
};

// Development mode
if (import.meta.env.DEV) {
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export { googleProvider };