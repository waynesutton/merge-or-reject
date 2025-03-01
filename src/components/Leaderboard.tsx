import React from "react";
import { Trophy, Clock } from "lucide-react";
import { GameScore } from "../types";

interface LeaderboardProps {
  scores: GameScore[];
  title: string;
  icon: "trophy" | "clock";
  limit?: number;
  onProfileClick?: (playerName: string) => void;
  isDarkMode: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  scores,
  title,
  icon,
  limit = 10,
  onProfileClick,
  isDarkMode,
}) => {
  const limitedScores = scores.slice(0, limit);
  const Icon = icon === "trophy" ? Trophy : Clock;

  // Helper function to capitalize the first letter
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className={`${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} rounded-lg p-6 shadow-lg`}>
      <div className="flex items-center space-x-2 mb-6">
        <Icon className="w-6 h-6 text-[#00FF94]" />
        <h2 className="text-xl">{title}</h2>
      </div>
      <div className="space-y-4">
        {limitedScores.map((score, index) => (
          <div
            key={score.id}
            className={`flex items-center justify-between p-3 ${
              isDarkMode ? "bg-black/30 hover:bg-black/50" : "bg-gray-100 hover:bg-gray-200"
            } rounded-lg transition-colors`}>
            <div className="flex items-center space-x-4">
              <span className="text-[#00FF94] font-mono w-6">{index + 1}</span>
              <div>
                <button
                  onClick={() => onProfileClick?.(score.playerName)}
                  className={`font-medium hover:text-[#00FF94] transition-colors text-left`}>
                  {score.playerName}
                </button>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {capitalizeFirstLetter(score.language)} · Level {score.level}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-[#00FF94]">
                {score.score}/{score.totalSnippets}
              </p>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {new Date(score.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
