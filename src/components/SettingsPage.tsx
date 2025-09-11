import React, { useEffect, useState } from 'react';
import { UserService } from '../services/firebaseService';
import { useLanguage } from '../contexts/LanguageContext';

const SettingsPage: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [language, setLangState] = useState(currentLanguage.code);
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    UserService.getUserProfile().then((p) => {
      if (!mounted || !p) return;
      const settings = (p as any).settings || {};
      setLangState(settings.language || currentLanguage.code);
      setNotifications(Boolean(settings.notificationsEnabled ?? true));
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await UserService.updateUserProfile({
        settings: {
          language,
          notificationsEnabled: notifications,
        }
      } as any);
      setMessage('Saved');
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
            <h2 className="font-semibold mb-2">General</h2>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-300">Language</span>
              <select
                value={language}
                onChange={(e) => setLangState(e.target.value)}
                className="input-modern max-w-[160px]"
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-300">Notifications</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-emerald-600 transition-colors relative">
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-400 text-sm">Changes apply immediately for language.</span>
            <button onClick={save} className="btn-modern px-4 py-2" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
          {message && <div className={`mt-3 text-sm ${message === 'Saved' ? 'text-emerald-300' : 'text-red-300'}`}>{message}</div>}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mt-6">
            <h2 className="font-semibold mb-2">Security</h2>
            <p className="text-slate-400 text-sm">Two-factor authentication and device management coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
