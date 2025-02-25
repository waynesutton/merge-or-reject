import React from 'react';
import { Zap } from 'lucide-react';
import { Level, LEVEL_TIMES } from '../types';

interface LevelSelectorProps {
  onSelect: (level: Level) => void;
  onBack: () => void;
  isDarkMode: boolean;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ onSelect, onBack, isDarkMode }) => {
  const levels = [
    { level: 1, time: LEVEL_TIMES[1], difficulty: 'Easy' },
    { level: 2, time: LEVEL_TIMES[2], difficulty: 'Medium' },
    { level: 3, time: LEVEL_TIMES[3], difficulty: 'Hard' },
  ];

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl mb-8">Select Difficulty</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {levels.map(({ level, time, difficulty }) => (
          <button
            key={level}
            onClick={() => onSelect(level as Level)}
            className={`group relative ${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white'} p-6 rounded-lg border-2 border-transparent hover:border-[#00FF94] transition-all duration-300 shadow-lg`}
          >
            <div className="absolute -top-3 -right-3">
              <div className="bg-[#00FF94] text-black w-8 h-8 rounded-full flex items-center justify-center">
                {level}
              </div>
            </div>
            <Zap className="w-8 h-8 text-[#00FF94] mx-auto mb-4" />
            <h3 className="text-xl mb-2">{difficulty}</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{time} seconds per round</p>
            <div className="mt-4 text-sm text-[#00FF94] opacity-0 group-hover:opacity-100 transition-opacity">
              Click to start →
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={onBack}
        className={`mt-8 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
      >
        ← Back to Language Selection
      </button>
    </div>
  );
};

export default LevelSelector