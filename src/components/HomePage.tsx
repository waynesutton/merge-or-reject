import React from 'react';
import { Trophy } from 'lucide-react';
import Leaderboard from './Leaderboard';
import LanguageSelector from './LanguageSelector';
import HowToPlay from './HowToPlay';
import { mockScores } from '../data/mockScores';
import { Language } from '../types';

interface HomePageProps {
  onLanguageSelect: (language: Language) => void;
  onProfileClick: (playerName: string) => void;
  isDarkMode: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onLanguageSelect, onProfileClick, isDarkMode }) => {
  const topScores = [...mockScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  const recentScores = [...mockScores]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-4">
          Developers; Are you smarter than AI?
          <span className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>VOL 1: API</span>
        </h1>
      </div>

      <div className="mb-16">
        <LanguageSelector onSelect={onLanguageSelect} isDarkMode={isDarkMode} />
      </div>

      <div className="mb-16">
        <HowToPlay isDarkMode={isDarkMode} />
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <div className="relative pb-[56.25%] h-0">
          <iframe
            src="https://www.youtube.com/embed/QXOZfIUOnQM"
            title="Merge or Reject Gameplay"
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Leaderboard
          scores={topScores}
          title="Top 10 Scores"
          icon="trophy"
          onProfileClick={onProfileClick}
          isDarkMode={isDarkMode}
        />
        <Leaderboard
          scores={recentScores}
          title="Recent 10 Games"
          icon="clock"
          onProfileClick={onProfileClick}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default HomePage