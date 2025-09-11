import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService, UserProfile } from '../services/authService';

export const useSimpleAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userProfile = await authService.getOrCreateUserProfile(firebaseUser);
          setProfile(userProfile);
          setError(null);
        } catch (e) {
          console.error('useSimpleAuth profile load error:', e);
          setProfile(null);
          setError('Failed to load user profile');
        }
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await authService.signOut();
    } catch {
      setError('Failed to log out');
    }
  };

  return {
    user,
    profile,
    isLoading,
    error,
    logout
  };
}; 