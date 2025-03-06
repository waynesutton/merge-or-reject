/**
 * GameContainer.tsx
 *
 * Main game component that handles game state, user interaction, and displays the game UI.
 *
 * Changes made:
 * - Added Header component to game screens
 * - Fixed user creation to only happen when a game starts
 * - Improved timer handling to use admin-configured time limits
 * - Added proper navigation between game states
 * - Fixed anonymous user creation and game start flow (2024-02-26)
 * - Fixed snippet loading by using by_language_difficulty index instead of by_language_volume
 *   to ensure correct snippet counts and availability for all languages
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import confetti from "canvas-confetti";
import { PowerGlitch } from "powerglitch";
import { useSwipeable } from "react-swipeable";
import { Level, Language, LEVEL_TIMES, LEVEL_ROUNDS } from "../types";
import CodeDisplay from "./CodeDisplay";
import LevelSelector from "./LevelSelector";
import Timer from "./Timer";
import GameResult from "./GameResult";
import Header from "./Header";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

interface GameContainerProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

interface GameState {
  currentIndex: number;
  score: number;
  gameOver: boolean;
  gameStarted: boolean;
  level: Level;
  language: Language | null;
  timeLeft: number;
  feedback: {
    message: string;
    isCorrect: boolean | null;
  };
  confettiActive: boolean;
  showWarning: boolean;
  showEndGameConfirm: boolean;
  showPartyEmoji: boolean;
}

// Add type for language volume from settings
interface LanguageVolume {
  language: string;
  currentVolume: number;
  snippetCount: number;
  status?: "active" | "paused" | "removed";
}

const GameContainer: React.FC<GameContainerProps> = ({ isDarkMode, onThemeToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [playerName, setPlayerName] = useState("Player 1");
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const createAnonymousUser = useMutation(api.users.createAnonymousUser);
  const rejectButtonRef = useRef<HTMLButtonElement>(null);
  const glitchInstanceRef = useRef<any>(null);
  const startGame = useMutation(api.game.startGame);
  const completeGame = useMutation(api.game.submitAnswer);
  const saveGameScore = useMutation(api.game.saveGameScore);
  const querySettings = useQuery(api.settings.getSettings);

  // Get language from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const languageParam = queryParams.get("language") as Language | null;

  const [gameState, setGameState] = useState<GameState>({
    currentIndex: 0,
    score: 0,
    gameOver: false,
    gameStarted: false,
    level: 1,
    language: languageParam,
    timeLeft: LEVEL_TIMES[1],
    feedback: {
      message: "",
      isCorrect: null,
    },
    confettiActive: false,
    showWarning: false,
    showEndGameConfirm: false,
    showPartyEmoji: false,
  });

  // Add state for game snippets
  const [gameId, setGameId] = useState<Id<"games"> | null>(null);
  const [snippets, setSnippets] = useState<
    Array<{
      _id: Id<"codeSnippets">;
      code: string;
      language: string;
      explanation?: string;
    }>
  >([]);
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);

  // Get language name from database
  const languageName = useQuery(
    api.game.getLanguageName,
    gameState.language ? { language: gameState.language } : "skip"
  );

  // If language is provided in URL, prepare for level selection
  useEffect(() => {
    if (languageParam && !gameState.gameStarted && userId) {
      setGameState((prev) => ({
        ...prev,
        language: languageParam,
      }));
    }
  }, [languageParam, userId, gameState.gameStarted]);

  // Setup glitch effect
  useEffect(() => {
    if (rejectButtonRef.current && !glitchInstanceRef.current) {
      glitchInstanceRef.current = PowerGlitch.glitch(rejectButtonRef.current, {
        playMode: "manual",
        createContainers: true,
        hideOverflow: false,
        timing: {
          duration: 1000,
        },
        glitchTimeSpan: {
          start: 0,
          end: 1,
        },
        shake: {
          velocity: 15,
          amplitudeX: 0.2,
          amplitudeY: 0.2,
        },
        slice: {
          count: 6,
          velocity: 15,
          minHeight: 0.02,
          maxHeight: 0.15,
          hueRotate: true,
        },
      });
    }

    return () => {
      if (glitchInstanceRef.current) {
        glitchInstanceRef.current.stopGlitch();
        glitchInstanceRef.current = null;
      }
    };
  }, [rejectButtonRef.current]);

  // Handle game timer
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (gameState.gameStarted && !gameState.gameOver && !gameState.feedback.message) {
      timeoutId = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft <= 1 ? 0 : prev.timeLeft - 1,
        }));

        if (gameState.timeLeft <= 1) {
          handleTimeout();
        }
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [gameState.gameStarted, gameState.gameOver, gameState.feedback.message, gameState.timeLeft]);

  // Add navigation warning when user tries to leave during an active game
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameState.gameStarted && !gameState.gameOver) {
        // Standard way to show a confirmation dialog when leaving the page
        e.preventDefault();
        e.returnValue = "You have an active game in progress. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [gameState.gameStarted, gameState.gameOver]);

  // Handle navigation warning within the app
  useEffect(() => {
    const handleNavigation = () => {
      if (gameState.gameStarted && !gameState.gameOver) {
        setGameState((prev) => ({
          ...prev,
          showWarning: true,
        }));
        return false;
      }
      return true;
    };

    return () => {
      // No cleanup needed since we're not using navigate for blocking
    };
  }, [gameState.gameStarted, gameState.gameOver]);

  // Handle confetti effect
  useEffect(() => {
    if (gameState.confettiActive) {
      // Single confetti burst from the top of the page
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      // Fire confetti from across the top of the screen
      for (let i = 0.1; i <= 0.9; i += 0.2) {
        confetti({
          ...defaults,
          particleCount: 50,
          origin: { x: i, y: 0 }, // y: 0 means top of the page
        });
      }
    }
  }, [gameState.confettiActive]);

  useEffect(() => {
    if (gameState.gameOver && gameId) {
      // Save game results when game is over
      saveGameScore({
        gameId,
        score: gameState.score,
      }).catch((error) => {
        console.error("Failed to save game results:", error);
      });
    }
  }, [gameState.gameOver, gameId, gameState.score, saveGameScore]);

  const resetGameState = () => {
    // Reset game state
    setGameState({
      currentIndex: 0,
      score: 0,
      gameOver: false,
      gameStarted: false,
      level: 1,
      language: languageParam, // Keep the language from URL
      timeLeft: LEVEL_TIMES[1],
      feedback: {
        message: "",
        isCorrect: null,
      },
      confettiActive: false,
      showWarning: false,
      showEndGameConfirm: false,
      showPartyEmoji: false,
    });

    // Reset game data
    setGameId(null);
    setSnippets([]);
    setTimeLimit(0);
    setUserAnswers([]);
  };

  const handleTimeout = () => {
    setGameState((prev) => ({
      ...prev,
      feedback: {
        message: "Time's up! Let's move to the next one.",
        isCorrect: false,
      },
    }));

    // Store user's answer as false (rejected) when timeout occurs
    setUserAnswers((prev) => [...prev, false]);

    setTimeout(() => {
      if (
        gameState.currentIndex >=
        (snippets.length > 0 ? snippets.length - 1 : LEVEL_ROUNDS[gameState.level] - 1)
      ) {
        setGameState((prev) => ({ ...prev, gameOver: true }));
      } else {
        setGameState((prev) => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          timeLeft: timeLimit > 0 ? timeLimit : LEVEL_TIMES[prev.level],
          feedback: { message: "", isCorrect: null },
        }));
      }
    }, 1500);
  };

  const handleVote = (isCorrect: boolean) => {
    if (!isCorrect && glitchInstanceRef.current) {
      glitchInstanceRef.current.startGlitch();
      setTimeout(() => {
        if (glitchInstanceRef.current) {
          glitchInstanceRef.current.stopGlitch();
        }
      }, 1000);
    }

    if (snippets.length <= gameState.currentIndex) {
      console.error("No snippet available for current index");
      // End the game when there are no more snippets available
      setGameState((prev) => ({ ...prev, gameOver: true }));
      return;
    }

    const currentSnippet = snippets[gameState.currentIndex];
    const isAnswerCorrect = isCorrect === (currentSnippet as any).isValid;

    // Store user's answer
    setUserAnswers((prev) => [...prev, isCorrect]);

    setGameState((prev) => ({
      ...prev,
      feedback: {
        message: isAnswerCorrect
          ? "Great job! You've got a keen eye for code!"
          : "Oops! That wasn't quite right. Keep practicing!",
        isCorrect: isAnswerCorrect,
      },
      score: isAnswerCorrect ? prev.score + 1 : prev.score,
      showPartyEmoji: isAnswerCorrect && isCorrect,
    }));

    setTimeout(() => {
      if (gameState.currentIndex >= snippets.length - 1) {
        setGameState((prev) => ({
          ...prev,
          gameOver: true,
          confettiActive: prev.score + (isAnswerCorrect ? 1 : 0) === snippets.length,
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          timeLeft: timeLimit > 0 ? timeLimit : LEVEL_TIMES[prev.level],
          feedback: { message: "", isCorrect: null },
          showPartyEmoji: false,
        }));
      }
    }, 1500);
  };

  const handleSkip = () => {
    // Store user's answer as null (skipped) when skipping
    setUserAnswers((prev) => [...prev, false]); // Treating skip as "reject" for simplicity

    if (
      gameState.currentIndex >= snippets.length - 1 ||
      gameState.currentIndex >= snippets.length
    ) {
      setGameState((prev) => ({ ...prev, gameOver: true }));
    } else {
      setGameState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        timeLeft: timeLimit > 0 ? timeLimit : LEVEL_TIMES[prev.level],
        feedback: { message: "", isCorrect: null },
      }));
    }
  };

  const handleLevelSelect = async (selectedLevel: Level) => {
    if (!gameState.language) {
      console.error("Missing language");
      return;
    }

    try {
      // Get settings to validate language status
      const settings = querySettings;
      if (!settings || !settings.volumes) {
        throw new Error("Settings not available");
      }

      // Find the language volume settings
      const languageVolume = settings.volumes.find(
        (vol: LanguageVolume) => vol.language === gameState.language
      );
      if (!languageVolume) {
        throw new Error("Language not configured");
      }

      // Check if language is active and has snippets
      if (languageVolume.status !== "active" && languageVolume.status !== undefined) {
        throw new Error("Language is not currently active");
      }

      // Get the difficulty level
      const difficulty = selectedLevel === 1 ? "easy" : selectedLevel === 2 ? "medium" : "hard";
      const snippetsNeeded = settings.settings.snippetsPerGame[difficulty];

      // Check if we have enough snippets for this difficulty level
      if (!languageVolume.snippetCount || languageVolume.snippetCount < snippetsNeeded) {
        throw new Error(
          `Not enough snippets available for ${difficulty} difficulty (need ${snippetsNeeded})`
        );
      }

      // Create anonymous user first if needed
      let currentUserId = userId;
      if (!currentUserId) {
        const result = await createAnonymousUser({ name: playerName });
        currentUserId = result.userId;
        setUserId(result.userId);
        setPlayerName(result.name);
      }

      // Start game with the confirmed userId
      const gameResult = await startGame({
        userId: currentUserId,
        language: gameState.language,
        level: selectedLevel,
        volume: languageVolume.currentVolume || 1,
      });

      // Store game data and use the timeLimit configured in admin settings
      setGameId(gameResult.gameId);
      setSnippets(gameResult.snippets);
      setTimeLimit(gameResult.timeLimit);

      setGameState((prev) => ({
        ...prev,
        level: selectedLevel,
        timeLeft: gameResult.timeLimit,
        gameStarted: true,
      }));
    } catch (error) {
      console.error("Failed to start game:", error);
      // Show more specific error to user
      alert(error instanceof Error ? error.message : "This game is not ready yet.");
      // Reset game state
      resetGameState();
    }
  };

  const handleEndGame = () => {
    setGameState((prev) => ({
      ...prev,
      showEndGameConfirm: true,
    }));
  };

  const confirmEndGame = () => {
    // Save the current game state before ending
    if (gameId) {
      saveGameScore({
        gameId,
        score: gameState.score,
      }).catch((error) => {
        console.error("Failed to save game results:", error);
      });
    }

    setGameState((prev) => ({
      ...prev,
      gameOver: true,
      showEndGameConfirm: false,
    }));
  };

  const cancelEndGame = () => {
    setGameState((prev) => ({
      ...prev,
      showEndGameConfirm: false,
    }));
  };

  const closeWarning = () => {
    setGameState((prev) => ({
      ...prev,
      showWarning: false,
    }));
  };

  // Add this useEffect to listen for keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleVote(true); // Merge (isCorrect) on Enter/Return
      } else if (e.key === "Escape") {
        handleVote(false); // Reject (isWrong) on Escape
      } else if (e.key === "s" || e.key === "S") {
        handleSkip(); // Skip on 's' or 'S'
      } else if (e.key === "q" || e.key === "Q") {
        handleEndGame(); // End game on 'q' or 'Q'
      }
    };

    // Add the event listener
    document.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleVote, handleSkip]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleVote(false), // Reject
    onSwipedRight: () => handleVote(true), // Merge
    onSwipedUp: () => handleSkip(), // Skip
    trackMouse: true,
    touchEventOptions: { passive: false },
  });

  const [showHint, setShowHint] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Add this useEffect to hide the hint after 5 seconds
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => {
        setShowHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  if (!gameState.gameStarted) {
    return (
      <>
        <Header isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />
        <LevelSelector
          onSelect={handleLevelSelect}
          onBack={() => navigate("/")}
          isDarkMode={isDarkMode}
          languageName={languageName}
        />
      </>
    );
  }

  if (gameState.gameOver) {
    return (
      <>
        <Header isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />
        <GameResult
          score={gameState.score}
          language={gameState.language || "typescript"}
          level={gameState.level}
          volume={1}
          onPlayAgain={resetGameState}
          userId={userId || ("" as Id<"users">)}
          playerName={playerName}
          isDarkMode={isDarkMode}
          maxRounds={snippets.length}
          gameId={gameId || undefined}
        />
      </>
    );
  }

  // Show game result if there are no snippets or if we've gone through all snippets
  if (snippets.length === 0 || gameState.currentIndex >= snippets.length) {
    return (
      <>
        <Header isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />
        <GameResult
          score={gameState.score}
          language={gameState.language || "typescript"}
          level={gameState.level}
          volume={1}
          onPlayAgain={resetGameState}
          userId={userId || ("" as Id<"users">)}
          playerName={playerName}
          isDarkMode={isDarkMode}
          maxRounds={snippets.length}
          gameId={gameId || undefined}
        />
      </>
    );
  }

  return (
    <div className="space-y-8 pb-24 pt-5">
      <Header isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />
      {gameState.language && (
        <h2
          className={`text-center text-2xl font-normal ${isDarkMode ? "text-white" : "text-gray-800"}`}>
          {languageName || gameState.language} -{" "}
          {gameState.level === 1 ? "Easy" : gameState.level === 2 ? "Medium" : "Hard"}
        </h2>
      )}
      <Timer
        timeLeft={gameState.timeLeft}
        total={timeLimit > 0 ? timeLimit : LEVEL_TIMES[gameState.level]}
        isDarkMode={isDarkMode}
      />
      {snippets.length > gameState.currentIndex && (
        <div className="flex-1 overflow-auto" {...swipeHandlers}>
          <div className="relative min-h-full">
            <AnimatePresence>
              {showHint && (
                <motion.div
                  className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}>
                  <div className="text-center p-6 rounded-lg relative">
                    <button
                      onClick={() => setShowHint(false)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white">
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold mb-4">Swipe to Review</h2>
                    <div className="flex justify-center gap-16 mb-6">
                      <div className="flex flex-col items-center">
                        <ArrowLeft className="w-12 h-12 text-red-500 mb-2" />
                        <span>Swipe Left to Reject</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <ArrowRight className="w-12 h-12 text-green-500 mb-2" />
                        <span>Swipe Right to Merge</span>
                      </div>
                    </div>
                    <p>Swipe anywhere or use the buttons below</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              ref={cardRef}
              className="min-h-full"
              animate={{
                x: isDragging ? dragOffset : 0,
                rotate: isDragging ? rotation : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <CodeDisplay
                code={snippets[gameState.currentIndex].code}
                explanation={snippets[gameState.currentIndex].explanation}
                isDarkMode={isDarkMode}
                isDragging={isDragging}
                dragOffset={dragOffset}
                rotation={rotation}
                opacity={opacity}
              />
            </motion.div>

            {isDragging && (
              <>
                {dragOffset > 0 && (
                  <div
                    className="fixed top-1/2 left-4 transform -translate-y-1/2 bg-green-500/80 rounded-full p-3"
                    style={{ opacity }}>
                    <Check className="w-8 h-8" />
                  </div>
                )}
                {dragOffset < 0 && (
                  <div
                    className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-red-500/80 rounded-full p-3"
                    style={{ opacity }}>
                    <X className="w-8 h-8" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <div className="fixed bottom-0 left-0 w-full py-4 px-6 flex justify-center items-center bg-white dark:bg-[#121212] shadow-md">
        <div className={`mr-4 font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
          Score: {gameState.score} | Remaining: {snippets.length - (gameState.currentIndex + 1)}
        </div>
        <div className="flex gap-6">
          <button onClick={() => handleVote(false)} className="flex flex-col items-center">
            <span className="hidden md:block text-xs text-gray-400 mb-1">ESC</span>
            <div className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </div>
            <span className="mt-1 text-sm text-white">Reject</span>
          </button>
          <button onClick={handleSkip} className="flex flex-col items-center">
            <span className="hidden md:block text-xs text-gray-400 mb-1">S</span>
            <div className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-gray-500 text-white shadow-lg hover:bg-gray-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="m18 15-6-6-6 6" />
              </svg>
            </div>
            <span className="mt-1 text-sm text-white">Skip</span>
          </button>
          <button onClick={() => handleVote(true)} className="flex flex-col items-center">
            <span className="hidden md:block text-xs text-gray-400 mb-1">ENTER</span>
            <div className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="mt-1 text-sm text-white">Merge</span>
          </button>
          <button onClick={handleEndGame} className="flex flex-col items-center">
            <span className="hidden md:block text-xs text-gray-400 mb-1">Q</span>
            <div className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                <line x1="12" y1="2" x2="12" y2="12"></line>
              </svg>
            </div>
            <span className="mt-1 text-sm text-white">End</span>
          </button>
        </div>
      </div>
      {gameState.feedback.message && (
        <div
          className={`text-center p-4 rounded ${
            gameState.feedback.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
          {gameState.feedback.message}
        </div>
      )}

      {/* End Game Confirmation Dialog */}
      {gameState.showEndGameConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">End Game?</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to end the current game? Your progress will be saved, but you
              won't be able to continue.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelEndGame}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
                Cancel
              </button>
              <button
                onClick={confirmEndGame}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                End Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Warning Dialog */}
      {gameState.showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">End Game?</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to end the current game? Your progress will be saved, but you
              won't be able to continue.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeWarning}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
                Cancel
              </button>
              <button
                onClick={() => {
                  closeWarning();
                  navigate("/");
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                End Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameContainer;
