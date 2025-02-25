import React from "react";
import { Trophy } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Leaderboard from "./Leaderboard";
import LanguageSelector from "./LanguageSelector";
import HowToPlay from "./HowToPlay";
import CodingCatGif from "./CodingCatGif";
import { Language } from "../types";

interface HomePageProps {
  onLanguageSelect: (language: Language) => void;
  isDarkMode: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onLanguageSelect, isDarkMode }) => {
  const topScores = useQuery(api.scores.getTopScores, { limit: 10 }) || [];
  const recentScores = useQuery(api.scores.getRecentScores, { limit: 10 }) || [];

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-4">
          Are you smarter than AI?
          <span className={`text-sm ml-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            VOL 1
          </span>
        </h1>
      </div>

      <div className="mb-16">
        <LanguageSelector onSelect={onLanguageSelect} isDarkMode={isDarkMode} />
      </div>

      <div className="mb-16">
        <HowToPlay isDarkMode={isDarkMode} />
      </div>

      <div className="max-w-4xl mx-auto mb-16 flex justify-center">
        <CodingCatGif />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Leaderboard
          scores={topScores}
          title="Top 10 Scores"
          icon="trophy"
          isDarkMode={isDarkMode}
        />
        <Leaderboard
          scores={recentScores}
          title="Recent 10 Games"
          icon="clock"
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default HomePage;
