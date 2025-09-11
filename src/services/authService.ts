// Helper to extract error code from unknown error
function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return (error as { code?: string }).code;
  }
  return undefined;
}
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  signInAnonymously,
  linkWithPopup
} from 'firebase/auth';
import { 
  updateDoc, 
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth, googleProvider } from '../firebase/config';

// Simplified interfaces for Google auth
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  balance: number;
  isAdmin: boolean;
  createdAt: Date | number | string | import('firebase/firestore').FieldValue;
  lastLoginAt: Date | number | string | import('firebase/firestore').FieldValue;
  authProvider: 'email' | 'google';
  level: number;
  experience: number;
  gamesPlayed: number;
  gamesWon: number;
  totalEarnings: number;
  achievements: string[];
  badges: string[];
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    notificationsEnabled: boolean;
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
  tutorial: {
    completed: boolean;
    currentStep: number;
    steps: {
      welcome: boolean;
      createGame: boolean;
      joinGame: boolean;
      playGame: boolean;
      wallet: boolean;
      settings: boolean;
    };
  };
  // Optional fields used by profile setup UI
  name?: string;
  phone?: string;
  bio?: string;
  favoriteLanguage?: string;
  stats?: {
    gamesPlayed: number;
    gamesWon: number;
    totalWinnings: number;
    currentStreak: number;
    level: number;
    experience: number;
  };
  telegramUsername?: string;
}

class AuthService {
  private currentUser: FirebaseUser | null = null;
  private userProfile: UserProfile | null = null;
  private authStateListeners: ((user: FirebaseUser | null) => void)[] = [];

  constructor() {
    this.setupAuthStateListener();
  }

  private setupAuthStateListener() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        await this.loadOrCreateUserProfile(user);
      } else {
        this.userProfile = null;
      }

      // Notify all listeners
      this.authStateListeners.forEach(callback => callback(user));
    });
  }

  private async loadOrCreateUserProfile(firebaseUser: FirebaseUser): Promise<void> {
    try {
      // Check if user profile exists
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        this.userProfile = { id: userSnap.id, ...userSnap.data() } as UserProfile;
        // Update last login
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        });
      } else {
        // New user, create profile with UID as document ID
  let newProfile: Partial<UserProfile>;
        if (firebaseUser.isAnonymous) {
          // Anonymous: no email field, just displayName and settings
          const displayName = firebaseUser.displayName && firebaseUser.displayName.length > 2
            ? firebaseUser.displayName
            : 'Guest' + Math.floor(Math.random() * 10000);
          newProfile = {
            displayName,
            settings: {
              soundEnabled: true,
              musicEnabled: true,
              notificationsEnabled: true,
              language: 'en',
              theme: 'auto'
            }
          };
        } else {
          newProfile = {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Google User',
            balance: 0,
            isAdmin: false,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            authProvider: 'google',
            level: 1,
            experience: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            totalEarnings: 0,
            achievements: [],
            badges: [],
            settings: {
              soundEnabled: true,
              musicEnabled: true,
              notificationsEnabled: true,
              language: 'en',
              theme: 'auto'
            },
            tutorial: {
              completed: false,
              currentStep: 0,
              steps: {
                welcome: false,
                createGame: false,
                joinGame: false,
                playGame: false,
                wallet: false,
                settings: false
              }
            }
          };
          // Only add photoURL if it exists
          if (firebaseUser.photoURL) {
            newProfile.photoURL = firebaseUser.photoURL;
          }
        }
        await setDoc(userDocRef, newProfile);
        this.userProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: newProfile.displayName || '',
          photoURL: newProfile.photoURL ?? undefined,
          balance: newProfile.balance ?? 0,
          isAdmin: newProfile.isAdmin ?? false,
          createdAt: newProfile.createdAt ?? serverTimestamp(),
          lastLoginAt: newProfile.lastLoginAt ?? serverTimestamp(),
          authProvider: newProfile.authProvider ?? 'google',
          level: newProfile.level ?? 1,
          experience: newProfile.experience ?? 0,
          gamesPlayed: newProfile.gamesPlayed ?? 0,
          gamesWon: newProfile.gamesWon ?? 0,
          totalEarnings: newProfile.totalEarnings ?? 0,
          achievements: newProfile.achievements ?? [],
          badges: newProfile.badges ?? [],
          settings: newProfile.settings ?? {
            soundEnabled: true,
            musicEnabled: true,
            notificationsEnabled: true,
            language: 'en',
            theme: 'auto'
          },
          tutorial: newProfile.tutorial ?? {
            completed: false,
            currentStep: 0,
            steps: {
              welcome: false,
              createGame: false,
              joinGame: false,
              playGame: false,
              wallet: false,
              settings: false
            }
          }
        };
      }
    } catch (error) {
      console.error('Error loading/creating user profile:', error);
      throw error;
    }
  }
  // To be replaced with Radix UI-based authentication logic
  // Optimized: Only store essential fields in user profile
  public async getOrCreateUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userDocRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      const profile = {
        id: userSnap.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        settings: data.settings,
      } as UserProfile;
      return profile;
    }
    
    // Create new profile
  let newProfile: Partial<UserProfile>;
    if (firebaseUser.isAnonymous) {
      newProfile = {
        displayName: 'Guest' + Math.floor(Math.random() * 10000),
        settings: {
          soundEnabled: true,
          musicEnabled: true,
          notificationsEnabled: true,
          language: 'en',
          theme: 'auto'
        }
      };
    } else {
      // Authenticated: include email and all checks
      newProfile = {
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'User',
        photoURL: typeof firebaseUser.photoURL === 'string' ? firebaseUser.photoURL : undefined,
        settings: {
          soundEnabled: true,
          musicEnabled: true,
          notificationsEnabled: true,
          language: 'en',
          theme: 'auto'
        }
      };
    }

    const userDocRefNew = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRefNew, newProfile);
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: newProfile.displayName || '',
      photoURL: newProfile.photoURL ?? undefined,
      balance: newProfile.balance ?? 0,
      isAdmin: newProfile.isAdmin ?? false,
      createdAt: newProfile.createdAt ?? serverTimestamp(),
      lastLoginAt: newProfile.lastLoginAt ?? serverTimestamp(),
      authProvider: newProfile.authProvider ?? 'google',
      level: newProfile.level ?? 1,
      experience: newProfile.experience ?? 0,
      gamesPlayed: newProfile.gamesPlayed ?? 0,
      gamesWon: newProfile.gamesWon ?? 0,
      totalEarnings: newProfile.totalEarnings ?? 0,
      achievements: newProfile.achievements ?? [],
      badges: newProfile.badges ?? [],
      settings: newProfile.settings ?? {
        soundEnabled: true,
        musicEnabled: true,
        notificationsEnabled: true,
        language: 'en',
        theme: 'auto'
      },
      tutorial: newProfile.tutorial ?? {
        completed: false,
        currentStep: 0,
        steps: {
          welcome: false,
          createGame: false,
          joinGame: false,
          playGame: false,
          wallet: false,
          settings: false
        }
      }
    };
  }

  // Google Sign In using popup with redirect fallback
  async signInWithGoogle(): Promise<void> {
    try {
      try {
        // Try popup first (better UX)
        const { signInWithPopup } = await import('firebase/auth');
        const result = await signInWithPopup(auth, googleProvider);
        if (result && result.user) {
          const user = result.user;
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (!userSnap.exists()) {
            const newProfile: Omit<UserProfile, 'id'> = {
              email: user.email || '',
              displayName: user.displayName || 'Google User',
              photoURL: user.photoURL || undefined,
              balance: 0,
              isAdmin: false,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
              authProvider: 'google',
              level: 1,
              experience: 0,
              gamesPlayed: 0,
              gamesWon: 0,
              totalEarnings: 0,
              achievements: [],
              badges: [],
              settings: { soundEnabled: true, musicEnabled: true, notificationsEnabled: true, language: 'en', theme: 'auto' },
              tutorial: { completed: false, currentStep: 0, steps: { welcome: false, createGame: false, joinGame: false, playGame: false, wallet: false, settings: false } }
            };
            await setDoc(userDocRef, newProfile);
          } else {
            await updateDoc(userDocRef, { lastLoginAt: serverTimestamp() });
          }
        }
        return;
      } catch (popupError: unknown) {
        const code = getErrorCode(popupError);
        if (code && !String(code).includes('popup')) {
          throw popupError;
        }
        await signInWithRedirect(auth, googleProvider);
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = result.user;
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (!userSnap.exists()) {
            const newProfile: Omit<UserProfile, 'id'> = {
              email: user.email || '',
              displayName: user.displayName || 'Google User',
              photoURL: typeof user.photoURL === 'string' ? user.photoURL : undefined,
              balance: 0,
              isAdmin: false,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
              authProvider: 'google',
              level: 1,
              experience: 0,
              gamesPlayed: 0,
              gamesWon: 0,
              totalEarnings: 0,
              achievements: [],
              badges: [],
              settings: { soundEnabled: true, musicEnabled: true, notificationsEnabled: true, language: 'en', theme: 'auto' },
              tutorial: { completed: false, currentStep: 0, steps: { welcome: false, createGame: false, joinGame: false, playGame: false, wallet: false, settings: false } }
            };
            await setDoc(userDocRef, newProfile);
          } else {
            await updateDoc(userDocRef, { lastLoginAt: serverTimestamp() });
          }
        }
      }
    } catch (error: unknown) {
      let message = 'Google sign-in failed.';
      const code = getErrorCode(error);
      if (code === 'auth/popup-closed-by-user') message = 'Popup closed before completing sign-in.';
      else if (code === 'auth/cancelled-popup-request') message = 'Another popup is open. Please try again.';
      else if (code === 'auth/popup-blocked') message = 'Popup was blocked. Please allow popups or we will redirect.';
      else if (code === 'auth/unauthorized-domain') message = 'Unauthorized domain. Add your domain in Firebase Auth settings.';
      console.error('Google sign-in error:', error);
      throw new Error(message);
    }
  }

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      let message = 'Authentication failed.';
      const code = getErrorCode(error);
      if (code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
      } else if (code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      }
      throw new Error(message);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      let message = 'Failed to send password reset email.';
      const code = getErrorCode(error);
      if (code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      throw new Error(message);
    }
  }

  // Email/Password Sign Up
  async signUpWithEmail(email: string, password: string, displayName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Create user profile for email signup
      const newProfile: Omit<UserProfile, 'id'> = {
        email: email,
        displayName: displayName,
        balance: 0,
        isAdmin: false,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        authProvider: 'email',
        level: 1,
        experience: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        totalEarnings: 0,
        achievements: [],
        badges: [],
        settings: {
          soundEnabled: true,
          musicEnabled: true,
          notificationsEnabled: true,
          language: 'en',
          theme: 'auto'
        },
        tutorial: {
          completed: false,
          currentStep: 0,
          steps: {
            welcome: false,
            createGame: false,
            joinGame: false,
            playGame: false,
            wallet: false,
            settings: false
          }
        }
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
  } catch (error: unknown) {
      console.error('Email signup error:', error);
      throw error;
    }
  }

  // Anonymous sign-in for instant guest access
  public async signInAnonymously(): Promise<FirebaseUser> {
    const result = await signInAnonymously(auth);
    return result.user;
  }

  // Link current user with Google for persistence
  public async linkWithGoogle(): Promise<FirebaseUser> {
    if (!auth.currentUser) throw new Error('No user to link');
    const result = await linkWithPopup(auth.currentUser, googleProvider);
    return result.user;
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }

  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  getCurrentUser(): FirebaseUser | null {
    return this.currentUser;
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser || !this.userProfile) throw new Error('No authenticated user');

    const userDoc = doc(db, 'users', this.userProfile.id);
    await updateDoc(userDoc, updates);
    
    // Update local profile
      this.userProfile = { ...this.userProfile, ...updates };
  }

  async updateTutorialProgress(step: keyof UserProfile['tutorial']['steps']): Promise<void> {
    if (!this.userProfile) return;

    const tutorialUpdates: UserProfile['tutorial'] = {
      currentStep: this.userProfile.tutorial.currentStep + 1,
      steps: {
        ...this.userProfile.tutorial.steps,
        [step]: true
      },
      completed: false
    };
    // Check if tutorial is completed
    const allStepsCompleted = Object.values({
      ...this.userProfile.tutorial.steps,
      [step]: true
    }).every(completed => completed);
    tutorialUpdates.completed = Boolean(allStepsCompleted);
    await this.updateUserProfile({ tutorial: tutorialUpdates });
  }

  // Game platform methods
  async addExperience(amount: number): Promise<void> {
    if (!this.userProfile) return;

    const newExperience = this.userProfile.experience + amount;
    const experiencePerLevel = 1000; // Experience needed per level
    const newLevel = Math.floor(newExperience / experiencePerLevel) + 1;

    const updates: Partial<UserProfile> = {
      experience: newExperience,
      level: newLevel
    };

    // Level up notification
    if (newLevel > this.userProfile.level) {
      console.log(`🎉 Level Up! You are now level ${newLevel}!`);
    }

    await this.updateUserProfile(updates);
  }
}

// Export singleton instance
export const authService = new AuthService(); 