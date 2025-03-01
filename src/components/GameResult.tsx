import React, { useState, useEffect } from "react";
import { Share2, RefreshCw, Twitter, Linkedin, BookOpen, X } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Link } from "react-router-dom";
import Confetti from "react-confetti";

interface GameResultProps {
  score: number;
  language: string;
  level: number;
  volume: number;
  onPlayAgain: () => void;
  isDarkMode: boolean;
  userId: Id<"users">;
  playerName: string;
  maxRounds?: number;
  gameId?: Id<"games">;
}

const GameResult: React.FC<GameResultProps> = ({
  score,
  language,
  level,
  volume,
  onPlayAgain,
  isDarkMode,
  userId,
  playerName,
  maxRounds: propMaxRounds,
  gameId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const [displayName, setDisplayName] = useState(playerName);
  const maxRounds = propMaxRounds || (level === 1 ? 3 : level === 2 ? 5 : 7);
  const [showConfetti, setShowConfetti] = useState(false);

  const updateName = useMutation(api.users.updateAnonymousUserName);

  // Get the game details to access the recap URL
  const game = useQuery(api.games.getGameById, gameId ? { gameId } : "skip");

  // Get the recap URL directly from the game
  const recapUrl = game?.recap;

  const shareText = `I scored ${score}/${maxRounds} on Merge playing ${language} (Level ${level}, Vol ${volume})! Can you beat my score? `;
  const shareUrl = window.location.origin;

  const shareToTwitter = () => {
    const fullUrl = recapUrl ? `${shareUrl}/${recapUrl}` : shareUrl;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(url, "_blank");
  };

  const shareToLinkedIn = () => {
    const fullUrl = recapUrl ? `${shareUrl}/${recapUrl}` : shareUrl;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const shareToBluesky = () => {
    const fullUrl = recapUrl ? `${shareUrl}/${recapUrl}` : shareUrl;
    navigator.clipboard.writeText(`${shareText}\n${fullUrl}`);
    alert("Share text copied to clipboard! You can now paste it in your Bluesky post.");
  };

  const handleNameSubmit = async () => {
    if (tempName.trim()) {
      try {
        await updateName({ userId, name: tempName.trim() });
        setDisplayName(tempName.trim());
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update name:", error);
      }
    }
  };

  // Initialize confetti when a perfect score is achieved
  useEffect(() => {
    if (score === maxRounds) {
      setShowConfetti(true);

      // Auto-hide confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 8000);

      // Handle escape key press
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setShowConfetti(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [score, maxRounds]);

  return (
    <div className="max-w-md mx-auto text-center">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
          />
          {/* Close button - placed in a corner with pointer-events-auto to make it clickable */}
          <div className="absolute top-4 right-4 pointer-events-auto">
            <button
              onClick={() => setShowConfetti(false)}
              className="bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <h2 className="text-3xl mb-4">Game Over!</h2>
      <div className={`${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} rounded-lg p-6 mb-6 shadow-lg`}>
        <div className="flex items-center justify-center space-x-2 mb-4">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className={`px-3 py-2 rounded-lg ${
                  isDarkMode ? "bg-black/30 text-white" : "bg-gray-100 text-black"
                }`}
                maxLength={20}
              />
              <button
                onClick={handleNameSubmit}
                className="px-3 py-2 bg-[#EE342F] text-white rounded-lg hover:bg-[#D42D29]">
                Save
              </button>
            </div>
          ) : (
            <>
              <span className="text-xl">{displayName}</span>
              <button
                onClick={() => setIsEditing(true)}
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} hover:text-[#EE342F]`}>
                (change)
              </button>
            </>
          )}
        </div>

        <p className="text-2xl text-[#EE342F] mb-2">
          {score}/{maxRounds}
        </p>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
          {language} · Level {level} · Volume {volume}
          <p className="text-lg mb-2 text-[#EE342F] py-5"> </p>
        </p>

        {score === maxRounds && (
          <div className={`mt-4 p-4 ${isDarkMode ? "bg-black/30" : "bg-gray-100"} rounded-lg`}>
            <p className="text-xl mb-2">Congrats! You are smarter than AI!</p>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Let the world know!</p>
          </div>
        )}

        {/* Add Recap Link */}
        {gameId && (
          <div className="mt-4">
            <Link
              to={`/${recapUrl}`}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#2A65F1] text-white rounded-lg hover:bg-[#2055D0] transition-colors">
              <BookOpen className="w-5 h-5" />
              <span>See your grade.</span>
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col space-y-3">
          <button
            onClick={shareToTwitter}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors">
            <Twitter className="w-5 h-5" />
            <span>Share on X</span>
          </button>

          <button
            onClick={shareToLinkedIn}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#094d92] transition-colors">
            <Linkedin className="w-5 h-5" />
            <span>Share on LinkedIn</span>
          </button>

          <button
            onClick={shareToBluesky}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#0085FF] text-white rounded-lg hover:bg-[#0066cc] transition-colors">
            <Share2 className="w-5 h-5" />
            <span>Share on Bluesky</span>
          </button>
        </div>

        <button
          onClick={onPlayAgain}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#EE342F] text-white rounded-lg mx-auto hover:bg-[#D42D29] transition-colors w-full">
          <RefreshCw className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};

export default GameResult;
