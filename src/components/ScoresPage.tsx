import React from "react";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Leaderboard from "./Leaderboard";
import { GameScore } from "../types";

interface ScoresPageProps {
  onBack: () => void;
  isDarkMode: boolean;
}

const ScoresPage: React.FC<ScoresPageProps> = ({ onBack, isDarkMode }) => {
  const rawTopScores = useQuery(api.scores.getTopScores, { limit: 20 }) || [];
  const rawRecentScores = useQuery(api.scores.getRecentScores, { limit: 20 }) || [];

  // Filter out null values and ensure type safety
  const topScores: GameScore[] = rawTopScores;
  const recentScores: GameScore[] = rawRecentScores;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className={`${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"} transition-colors`}>
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
            isDarkMode={isDarkMode}
          />
        </div>
        <div>
          <Leaderboard
            scores={recentScores}
            title="Recent 20 Games"
            icon="clock"
            limit={20}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default ScoresPage;
