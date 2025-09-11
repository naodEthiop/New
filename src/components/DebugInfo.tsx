import React from 'react';
import { useSimpleAuth } from '../hooks/useSimpleAuth';

const DebugInfo: React.FC = () => {
  const { user, profile, isLoading, error } = useSimpleAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>User: {user ? `${user.email} (${user.uid})` : 'None'}</div>
        <div>Profile: {profile ? `${profile.displayName} (${profile.id})` : 'None'}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
        <div className="text-gray-400">
          Auth State: {user ? 'Authenticated' : 'Not Authenticated'}
        </div>
        <div className="text-gray-400">
          Profile State: {profile ? 'Loaded' : 'Not Loaded'}
        </div>
      </div>
    </div>
  );
};

export default DebugInfo; 