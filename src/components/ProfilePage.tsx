import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold">
            {(user?.displayName || user?.email || 'U')[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.displayName || 'Profile'}</h1>
            <p className="text-slate-300 text-sm">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-cyber p-4">
            <h2 className="font-semibold mb-2">Account</h2>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>UID: <span className="text-slate-400">{user?.uid}</span></li>
              <li>Verified: <span className="text-slate-400">{user?.emailVerified ? 'Yes' : 'No'}</span></li>
              <li>Provider: <span className="text-slate-400">{user?.providerData?.[0]?.providerId || 'password'}</span></li>
            </ul>
          </div>
          <div className="card-cyber p-4">
            <h2 className="font-semibold mb-2">Preferences</h2>
            <p className="text-slate-400 text-sm">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
