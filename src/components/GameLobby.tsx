import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameLobby: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToGames = () => {
    navigate('/game-list');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Game Lobby
          </h1>
          <p className="text-gray-300">Waiting for players...</p>
        </div>

        {/* Loading Animation */}
        <div className="text-center mb-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="mt-4 text-gray-300">Connecting to game...</p>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">Game Room: Bingo Night</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Players:</span>
              <span className="text-yellow-400 font-bold">3/8</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Entry Fee:</span>
              <span className="text-green-400 font-bold">₦500</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Prize Pool:</span>
              <span className="text-yellow-400 font-bold">₦4,000</span>
            </div>
          </div>
        </div>

        {/* Player List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">Players</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">1</span>
              </div>
              <span>Player 1 (You)</span>
              <span className="ml-auto text-green-400">Ready</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">2</span>
              </div>
              <span>Player 2</span>
              <span className="ml-auto text-green-400">Ready</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">3</span>
              </div>
              <span>Player 3</span>
              <span className="ml-auto text-yellow-400">Joining...</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={handleBackToGames}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Back to Games
        </button>
      </div>
    </div>
  );
};

export default GameLobby;