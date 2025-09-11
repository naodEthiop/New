import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="aurora-layer"></div>
      <div className="glow-orb left-[-60px] top-[120px]"></div>
      <div className="glow-orb right-[-80px] bottom-[160px]"></div>
      <div className="relative z-10 text-center">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold brand-gradient gaming-font">Bingo Platform</h1>
          <p className="text-slate-300 mt-2">Loading your gaming experience...</p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-16 h-16 border-4 border-gray-600 border-t-yellow-400 rounded-full animate-spin"></div>
            
            {/* Inner ring */}
            <div className="absolute top-2 left-2 w-12 h-12 border-4 border-gray-600 border-t-orange-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            
            {/* Center dot */}
            <div className="absolute top-6 left-6 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="mt-4 text-gray-400 text-sm">
          <p>Initializing game engine...</p>
          <p className="mt-1">Connecting to servers...</p>
          <p className="mt-1">Loading assets...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 