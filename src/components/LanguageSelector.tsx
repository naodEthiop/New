import React from 'react';
import { languageManager, t } from '../utils/languages';

const LanguageSelector: React.FC = () => {
  const currentLanguage = languageManager.getCurrentLanguage();

  const handleLanguageChange = (language: 'en' | 'am') => {
    languageManager.setLanguage(language);
    // Reload the page to apply language changes
    window.location.reload();
  };

  return (
    <div className="language-selector">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-white/80">{t('language')}:</span>
        <div className="flex bg-white/10 rounded-lg p-1">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              currentLanguage === 'en'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            🇺🇸 English
          </button>
          <button
            onClick={() => handleLanguageChange('am')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              currentLanguage === 'am'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            🇪🇹 አማርኛ
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector; 