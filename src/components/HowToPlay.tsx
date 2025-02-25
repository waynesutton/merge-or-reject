import React from 'react';
import { Code2, ThumbsUp, ThumbsDown, Timer } from 'lucide-react';

interface HowToPlayProps {
  isDarkMode: boolean;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ isDarkMode }) => {
  return (
    <div className="max-w-4xl mx-auto mb-16">
      <h2 className="text-2xl mb-6 text-center">How to Play</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-[#00FF94] rounded-full flex items-center justify-center text-black font-medium">
              1
            </div>
            <h3 className="font-medium">Review the Code</h3>
          </div>
          <div className={`${isDarkMode ? 'bg-black/30' : 'bg-gray-100'} rounded-lg p-4 mb-4`}>
            <div className="flex space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className={`font-mono text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              function example() {
                // Code snippet
              }
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Each round shows you a code snippet. Your job is to determine if it's valid or contains bugs.
          </p>
        </div>

        <div className={`${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-[#00FF94] rounded-full flex items-center justify-center text-black font-medium">
              2
            </div>
            <h3 className="font-medium">Make Your Decision</h3>
          </div>
          <div className="flex justify-center space-x-4 mb-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg">
              <ThumbsDown className="w-4 h-4" />
              <span>Reject</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg">
              <ThumbsUp className="w-4 h-4" />
              <span>Merge</span>
            </button>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Click Merge if the code is correct, or Reject if you spot any issues. Be quick but careful!
          </p>
        </div>

        <div className={`${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-[#00FF94] rounded-full flex items-center justify-center text-black font-medium">
              3
            </div>
            <h3 className="font-medium">Beat the Clock</h3>
          </div>
          <div className="mb-4">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-[#00FF94] w-3/4"></div>
            </div>
            <div className={`mt-2 text-right text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Timer className="w-4 h-4 inline mr-2" />
              Time remaining
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Complete the rounds based on difficulty level within the time limit. A perfect score to unlock the confetti celebration!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay