import React from 'react';
import { Code2 } from 'lucide-react';
import { SignInButton, useUser } from '@clerk/clerk-react';
import { Language, LANGUAGES } from '../types';

interface LanguageSelectorProps {
  onSelect: (language: Language) => void;
  onBack?: () => void;
  isDarkMode: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, onBack, isDarkMode }) => {
  const { isSignedIn } = useUser();
  
  const languages = Object.entries(LANGUAGES).map(([key, name]) => ({
    key: key as Language,
    name,
  }));

  return (
    <div className="max-w-4xl mx-auto text-center">
      <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
        Select your language, review 10 code snippets, and decide whether to Merge (correct) or Reject (broken). A perfect score = confetti!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map(({ key, name }) => (
          <button
            key={key}
            onClick={() => {
              if (!isSignedIn) {
                const signInButton = document.querySelector('[data-clerk-sign-in]') as HTMLElement;
                if (signInButton) {
                  signInButton.click();
                }
                return;
              }
              onSelect(key);
            }}
            className={`group relative ${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white'} p-6 rounded-lg border-2 border-transparent hover:border-[#00FF94] transition-all duration-300 shadow-lg`}
          >
            <Code2 className="w-8 h-8 text-[#00FF94] mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{name}</h3>
            <div className="mt-4 text-sm text-[#00FF94] opacity-0 group-hover:opacity-100 transition-opacity">
              {isSignedIn ? 'Click to select →' : 'Sign in to play →'}
            </div>
          </button>
        ))}
      </div>
      {onBack && (
        <button
          onClick={onBack}
          className={`mt-8 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
        >
          ← Back to Admin Dashboard
        </button>
      )}
    </div>
  );
};

export default LanguageSelector