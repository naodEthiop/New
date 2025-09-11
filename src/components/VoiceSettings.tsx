import React, { useState, useEffect } from 'react';

const VoiceSettings: React.FC = () => {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [volume, setVolume] = useState(80);
  const [voiceType, setVoiceType] = useState('female');

  useEffect(() => {
    // No Telegram WebApp initialization or main button setup needed
  }, []);

  const handleBackToWelcome = () => {
    console.log('Back to Welcome clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Voice Settings
          </h1>
          <p className="text-gray-300">Customize your audio experience</p>
        </div>

        {/* Voice Toggle */}
        <div className="modern-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-yellow-400">Voice Announcements</h3>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                voiceEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-gray-300 text-sm">
            {voiceEnabled ? 'Voice announcements are enabled' : 'Voice announcements are disabled'}
          </p>
        </div>

        {/* Volume Control */}
        <div className="modern-card p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">Volume</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-gray-300">{volume}%</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Quiet</span>
              <span>Loud</span>
            </div>
          </div>
        </div>

        {/* Voice Type */}
        <div className="modern-card p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">Voice Type</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="voiceType"
                value="female"
                checked={voiceType === 'female'}
                onChange={(e) => setVoiceType(e.target.value)}
                className="w-4 h-4 text-yellow-400 bg-white/10 border-white/20 focus:ring-yellow-400"
              />
              <span className="text-white">Female Voice</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="voiceType"
                value="male"
                checked={voiceType === 'male'}
                onChange={(e) => setVoiceType(e.target.value)}
                className="w-4 h-4 text-yellow-400 bg-white/10 border-white/20 focus:ring-yellow-400"
              />
              <span className="text-white">Male Voice</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="voiceType"
                value="robot"
                checked={voiceType === 'robot'}
                onChange={(e) => setVoiceType(e.target.value)}
                className="w-4 h-4 text-yellow-400 bg-white/10 border-white/20 focus:ring-yellow-400"
              />
              <span className="text-white">Robot Voice</span>
            </label>
          </div>
        </div>

        {/* Test Voice Button */}
        <button
          onClick={() => console.log('Testing voice...')}
          className="w-full btn-modern mb-6"
        >
          Test Voice
        </button>

        {/* Back Button */}
        <button
          onClick={handleBackToWelcome}
          className="w-full btn-secondary"
        >
          Back to Welcome
        </button>
      </div>
    </div>
  );
};

export default VoiceSettings; 