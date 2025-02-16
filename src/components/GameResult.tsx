import React from 'react';
import { Share2, RefreshCw, Twitter, Linkedin } from 'lucide-react';

interface GameResultProps {
  score: number;
  language: string;
  level: number;
  volume: number;
  onPlayAgain: () => void;
  isDarkMode: boolean;
}

const GameResult: React.FC<GameResultProps> = ({ 
  score, 
  language, 
  level,
  volume,
  onPlayAgain,
  isDarkMode
}) => {
  const shareText = `I scored ${score}/10 on Merge or Reject playing ${language} (Level ${level}, Vol ${volume})! Can you beat my score? 🚀 #coding #MergeOrReject`;
  const shareUrl = window.location.origin;

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToBluesky = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    alert('Share text copied to clipboard! You can now paste it in your Bluesky post.');
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-3xl mb-4">Game Over!</h2>
      <div className={`${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white'} rounded-lg p-6 mb-6 shadow-lg`}>
        <p className="text-2xl text-[#00FF94] mb-2">{score}/10</p>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          {language} · Level {level} · Volume {volume}
        </p>
        {score <= 5 && (
          <div className={`mt-4 p-4 ${isDarkMode ? 'bg-black/30' : 'bg-gray-100'} rounded-lg`}>
            <p className="text-xl mb-2">😂 You are not smarter than AI!</p>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Don't worry, you can always try again!</p>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col space-y-3">
          <button
            onClick={shareToTwitter}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors"
          >
            <Twitter className="w-5 h-5" />
            <span>Share on X</span>
          </button>
          
          <button
            onClick={shareToLinkedIn}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#094d92] transition-colors"
          >
            <Linkedin className="w-5 h-5" />
            <span>Share on LinkedIn</span>
          </button>
          
          <button
            onClick={shareToBluesky}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#0085FF] text-white rounded-lg hover:bg-[#0066cc] transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share on Bluesky</span>
          </button>
        </div>
        
        <button
          onClick={onPlayAgain}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#00FF94] text-black rounded-lg mx-auto hover:bg-[#00CC77] transition-colors w-full"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};

export default GameResult