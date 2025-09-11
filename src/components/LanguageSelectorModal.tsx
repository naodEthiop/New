import React from 'react';
import { useNavigate } from 'react-router-dom';

const LanguageSelectorModal: React.FC = () => {
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
            Language
          </h1>
          <p className="text-gray-300">Choose your preferred language</p>
        </div>

        {/* Language Options */}
        <div className="panel-cyber rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">Available Languages</h3>
          <div className="space-y-3">
            <div className="text-gray-300">• English</div>
            <div className="text-gray-300">• Spanish</div>
            <div className="text-gray-300">• French</div>
            <div className="text-gray-300">• German</div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={handleBackToWelcome}
          className="w-full btn-modern rounded-2xl"
        >
          Back to Welcome
        </button>
      </div>
    </div>
  );
};

export default LanguageSelectorModal;
