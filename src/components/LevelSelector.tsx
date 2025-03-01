/**
 * LevelSelector.tsx
 *
 * Changes made:
 * - Added useQuery hook to fetch game settings from database
 * - Updated levels to use dynamic settings from database
 * - Added loading state while fetching settings
 * - Added display of snippets per game from settings
 * - Added check for snippet availability by difficulty
 */

import React from "react";
import { Zap } from "lucide-react";
import { Level } from "../types";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface LevelSelectorProps {
  onSelect: (level: Level) => void;
  onBack: () => void;
  isDarkMode: boolean;
  languageName?: string;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  onSelect,
  onBack,
  isDarkMode,
  languageName,
}) => {
  const settings = useQuery(api.settings.getSettings);

  // Get the language key from the languageName prop - normalize to lowercase
  const language = languageName?.toLowerCase() || "";

  // Check if snippets are available for each difficulty level
  const easySnippets = useQuery(api.snippets.checkSnippetsAvailability, {
    language,
    difficulty: "easy",
  });

  const mediumSnippets = useQuery(api.snippets.checkSnippetsAvailability, {
    language,
    difficulty: "medium",
  });

  const hardSnippets = useQuery(api.snippets.checkSnippetsAvailability, {
    language,
    difficulty: "hard",
  });

  if (
    !settings ||
    easySnippets === undefined ||
    mediumSnippets === undefined ||
    hardSnippets === undefined
  ) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF94]"></div>
      </div>
    );
  }

  const levels = [
    {
      level: 1,
      time: settings.settings.timeLimits.easy,
      snippets: settings.settings.snippetsPerGame.easy,
      difficulty: "Easy",
      available: easySnippets,
      difficultyKey: "easy",
    },
    {
      level: 2,
      time: settings.settings.timeLimits.medium,
      snippets: settings.settings.snippetsPerGame.medium,
      difficulty: "Medium",
      available: mediumSnippets,
      difficultyKey: "medium",
    },
    {
      level: 3,
      time: settings.settings.timeLimits.hard,
      snippets: settings.settings.snippetsPerGame.hard,
      difficulty: "Hard",
      available: hardSnippets,
      difficultyKey: "hard",
    },
  ];

  return (
    <div className="flex flex-col justify-center min-h-[calc(100vh-16rem)]">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl mb-8">
          {languageName ? `${languageName}: Select Difficulty` : "Select Difficulty"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map(({ level, time, snippets, difficulty, available, difficultyKey }) => (
            <button
              key={level}
              onClick={() => (available ? onSelect(level as Level) : null)}
              disabled={!available}
              className={`group relative ${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} p-6 rounded-lg border-2 border-transparent ${
                available
                  ? `hover:border-[#00FF94] transition-all duration-300`
                  : `opacity-50 cursor-not-allowed`
              } shadow-lg`}>
              <div className="absolute -top-3 -right-3">
                <div className="bg-[#00FF94] text-black w-8 h-8 rounded-full flex items-center justify-center">
                  {level}
                </div>
              </div>
              <Zap className="w-8 h-8 text-[#00FF94] mx-auto mb-4" />
              <h3 className="text-xl mb-2">{difficulty}</h3>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                {time} seconds per round
              </p>
              <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                {snippets} snippets per game
              </p>
              <div className="mt-4 text-sm text-[#00FF94] opacity-0 group-hover:opacity-100 transition-opacity">
                {available ? "Click to start →" : "No snippets available"}
              </div>
              {!available && (
                <div className="mt-2 text-xs text-red-400">
                  No {difficultyKey} snippets available
                </div>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={onBack}
          className={`mt-8 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"} transition-colors`}>
          ← Back to Language Selection
        </button>
      </div>
    </div>
  );
};

export default LevelSelector;
