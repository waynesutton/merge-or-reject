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
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import confetti from "canvas-confetti";
import { PowerGlitch } from "powerglitch";
import { Level, Language, LEVEL_TIMES, LEVEL_ROUNDS } from "../types";
import CodeDisplay from "./CodeDisplay";
import LevelSelector from "./LevelSelector";
import Timer from "./Timer";
import GameResult from "./GameResult";
import Header from "./Header";

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

const GameContainer: React.FC<GameContainerProps> = ({ isDarkMode, onThemeToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [playerName, setPlayerName] = useState("Player 1");
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const createAnonymousUser = useMutation(api.users.createAnonymousUser);
  const rejectButtonRef = useRef<HTMLButtonElement>(null);
  const glitchInstanceRef = useRef<any>(null);
  const startGame = useMutation(api.game.startGame);
  const completeGame = useMutation(api.game.completeGame);

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
    }>
  >([]);
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);

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

  // Handle confetti effect
  useEffect(() => {
    if (gameState.confettiActive) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [gameState.confettiActive]);

  useEffect(() => {
    if (gameState.gameOver && gameId) {
      // Save game results when game is over
      completeGame({
        gameId,
        score: gameState.score,
        userAnswers,
      }).catch((error) => {
        console.error("Failed to save game results:", error);
      });
    }
  }, [gameState.gameOver, gameId, gameState.score, userAnswers, completeGame]);

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
        gameState.currentIndex ===
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

  const handleVote = (isHot: boolean) => {
    if (!isHot && glitchInstanceRef.current) {
      glitchInstanceRef.current.startGlitch();
      setTimeout(() => {
        if (glitchInstanceRef.current) {
          glitchInstanceRef.current.stopGlitch();
        }
      }, 1000);
    }

    if (snippets.length <= gameState.currentIndex) {
      console.error("No snippet available for current index");
      return;
    }

    const currentSnippet = snippets[gameState.currentIndex];
    const isCorrect = isHot === currentSnippet.isValid;

    // Store user's answer
    setUserAnswers((prev) => [...prev, isHot]);

    setGameState((prev) => ({
      ...prev,
      feedback: {
        message: isCorrect
          ? "Great job! You've got a keen eye for code!"
          : "Oops! That wasn't quite right. Keep practicing!",
        isCorrect,
      },
      score: isCorrect ? prev.score + 1 : prev.score,
      showPartyEmoji: isCorrect && isHot,
    }));

    setTimeout(() => {
      if (
        gameState.currentIndex ===
        (snippets.length > 0 ? snippets.length - 1 : LEVEL_ROUNDS[gameState.level] - 1)
      ) {
        setGameState((prev) => ({
          ...prev,
          gameOver: true,
          confettiActive:
            prev.score + (isCorrect ? 1 : 0) ===
            (snippets.length > 0 ? snippets.length : LEVEL_ROUNDS[prev.level]),
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
      gameState.currentIndex ===
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
  };

  const handleLevelSelect = async (selectedLevel: Level) => {
    if (!gameState.language) {
      console.error("Missing language");
      return;
    }

    try {
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
        volume: 1, // Default to volume 1 for now
      });

      // Store game data and use the timeLimit configured in admin settings
      setGameId(gameResult.gameId);
      setSnippets(gameResult.snippets);
      setTimeLimit(gameResult.timeLimit);

      setGameState((prev) => ({
        ...prev,
        level: selectedLevel,
        timeLeft: gameResult.timeLimit, // Use server-provided time limit
        gameStarted: true,
      }));
    } catch (error) {
      console.error("Failed to start game:", error);
      // Show error to user
      alert("This game is not ready yet.");
      // Reset game state
      resetGameState();
    }
  };

  if (!gameState.gameStarted) {
    return (
      <>
        <Header isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />
        <LevelSelector
          onSelect={handleLevelSelect}
          onBack={() => navigate("/")}
          isDarkMode={isDarkMode}
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
          isDarkMode={isDarkMode}
          userId={userId || ("" as Id<"users">)}
          playerName={playerName}
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      <Header isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />
      <Timer
        timeLeft={gameState.timeLeft}
        total={timeLimit > 0 ? timeLimit : LEVEL_TIMES[gameState.level]}
        isDarkMode={isDarkMode}
      />
      {snippets.length > gameState.currentIndex && (
        <CodeDisplay
          code={snippets[gameState.currentIndex].code}
          language={gameState.language || "typescript"}
          isDarkMode={isDarkMode}
        />
      )}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => handleVote(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Merge
        </button>
        <button
          ref={rejectButtonRef}
          onClick={() => handleVote(false)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Reject
        </button>
        <button
          onClick={handleSkip}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Skip
        </button>
      </div>
      {gameState.feedback.message && (
        <div
          className={`text-center p-4 rounded ${
            gameState.feedback.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
          {gameState.feedback.message}
        </div>
      )}
    </div>
  );
};

export default GameContainer;
