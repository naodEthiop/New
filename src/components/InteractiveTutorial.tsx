import React from 'react';
import { useNavigate } from 'react-router-dom';

const InteractiveTutorial: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToWelcome = () => {
    navigate('/welcome');
    };

    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Tutorial
          </h1>
          <p className="text-gray-300">Learn how to play Bingo</p>
        </div>

        {/* Tutorial Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">How to Play</h3>
          <div className="space-y-3 text-gray-300">
            <div>1. Join a game room</div>
            <div>2. Wait for the game to start</div>
            <div>3. Mark numbers as they're called</div>
            <div>4. Complete a line to win!</div>
          </div>
        </div>
        
        {/* Back Button */}
        <button
          onClick={handleBackToWelcome}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Back to Welcome
        </button>
      </div>
    </div>
  );
};

export default InteractiveTutorial;