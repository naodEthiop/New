import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const ProfileSetup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName || 'Player',
        settings: {
          language,
          theme,
          soundEnabled: true,
          musicEnabled: true,
          notificationsEnabled: true,
        },
        tutorial: {
          completed: true,
          currentStep: 5,
          steps: {
            welcome: true,
            createGame: true,
            joinGame: true,
            playGame: true,
            wallet: true,
            settings: true,
          },
        },
      });
      onComplete();
    } catch (e) {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="aurora-layer"></div>
      <div className="glow-orb left-[-60px] top-[120px]"></div>
      <div className="glow-orb right-[-80px] bottom-[160px]"></div>
      <div className="relative z-10 w-full max-w-md modern-card p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
        <p className="text-slate-300 mb-6">Set up your profile to start playing.</p>
        {error && <div className="mb-3 text-red-400 text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Display Name</label>
            <input className="input-modern" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Language</label>
            <select className="input-modern" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="am">Amharic</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Theme</label>
            <select className="input-modern" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <button className="btn-success w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
