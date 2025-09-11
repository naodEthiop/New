import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { languageService, LanguageConfig, ETHIOPIAN_LANGUAGES } from '../services/languageService';

interface LanguageContextType {
  currentLanguage: LanguageConfig;
  setLanguage: (languageCode: string) => void;
  t: (key: string) => string;
  translateNumber: (number: number) => string;
  translateLetter: (letter: string) => string;
  availableLanguages: LanguageConfig[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageConfig>(
    languageService.getCurrentLanguage()
  );

  const setLanguage = (languageCode: string) => {
    languageService.setLanguage(languageCode);
    const newLanguage = ETHIOPIAN_LANGUAGES.find(lang => lang.code === languageCode);
    if (newLanguage) {
      setCurrentLanguage(newLanguage);
    }
  };

  const t = (key: string): string => {
    return currentLanguage.phrases[key] || key;
  };

  const translateNumber = (number: number): string => {
    return currentLanguage.getNumberText(number);
  };

  const translateLetter = (letter: string): string => {
    return currentLanguage.getLetterText(letter);
  };

  useEffect(() => {
    // Initialize language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      const language = ETHIOPIAN_LANGUAGES.find(lang => lang.code === savedLanguage);
      if (language) {
        setCurrentLanguage(language);
      }
    }
  }, []);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    translateNumber,
    translateLetter,
    availableLanguages: ETHIOPIAN_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 