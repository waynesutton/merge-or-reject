/**
 * HomePage.tsx
 *
 * The main landing page for the application.
 *
 * Changes made:
 * - Added Header component to fix missing header issue
 * - Removed redundant title since it's now in the Header
 * - Maintained layout for language selection, how to play, and leaderboards
 * - Added Clerk instance passing to Header for admin logout (2024-03-14)
 * - Made Clerk usage optional to prevent context errors (2024-03-14)
 * - Added theme toggle support (2024-03-14)
 */

import React from "react";
import { Trophy } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Header from "./Header";
import Leaderboard from "./Leaderboard";
import LanguageSelector from "./LanguageSelector";
import HowToPlay from "./HowToPlay";
import CodingCatGif from "./CodingCatGif";
import { Language } from "../types";

interface HomePageProps {
  onLanguageSelect: (language: Language) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  clerk?: any;
}

const HomePage: React.FC<HomePageProps> = ({
  onLanguageSelect,
  isDarkMode,
  onThemeToggle,
  clerk,
}) => {
  const topScores = useQuery(api.scores.getTopScores, { limit: 10 }) || [];
  const recentScores = useQuery(api.scores.getRecentScores, { limit: 10 }) || [];

  return (
    <div>
      <Header isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} clerk={clerk} />

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
