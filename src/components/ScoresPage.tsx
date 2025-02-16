import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Leaderboard from './Leaderboard';
import { mockScores } from '../data/mockScores';

interface ScoresPageProps {
  onBack: () => void;
  onProfileClick: (playerName: string) => void;
  isDarkMode: boolean;
}

const ScoresPage: React.FC<ScoresPageProps> = ({ onBack, onProfileClick, isDarkMode }) => {
  const topScores = [...mockScores].sort((a, b) => b.score - a.score);
  const recentScores = [...mockScores].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl">Leaderboards</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Leaderboard
            scores={topScores}
            title="Top 20 Scores"
            icon="trophy"
            limit={20}
            onProfileClick={onProfileClick}
            isDarkMode={isDarkMode}
          />
        </div>
        <div>
          <Leaderboard
            scores={recentScores}
            title="Recent 20 Games"
            icon="clock"
            limit={20}
            onProfileClick={onProfileClick}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default ScoresPage