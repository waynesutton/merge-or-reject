import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import confetti from "canvas-confetti";
import { PowerGlitch } from "powerglitch";
import { Level, Language, LEVEL_TIMES, LEVEL_ROUNDS } from "../types";
import { mockCodeSnippets } from "../data/mockData";
import CodeDisplay from "./CodeDisplay";
import LevelSelector from "./LevelSelector";
import Timer from "./Timer";
import GameResult from "./GameResult";

interface GameContainerProps {
  isDarkMode: boolean;
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

const GameContainer: React.FC<GameContainerProps> = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("Player 1");
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const createAnonymousUser = useMutation(api.users.createAnonymousUser);
  const rejectButtonRef = useRef<HTMLButtonElement>(null);
  const glitchInstanceRef = useRef<any>(null);

  const [gameState, setGameState] = useState<GameState>({
    currentIndex: 0,
    score: 0,
    gameOver: false,
    gameStarted: false,
    level: 1,
    language: null,
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

  // Initialize anonymous user when component mounts
  useEffect(() => {
    const initUser = async () => {
      if (!userId) {
        try {
          const result = await createAnonymousUser();
          setUserId(result.userId);
          setPlayerName(result.name);
        } catch (error) {
          console.error("Failed to create anonymous user:", error);
        }
      }
    };
    initUser();
  }, [createAnonymousUser, userId]);

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

  const resetGameState = () => {
    setGameState({
      currentIndex: 0,
      score: 0,
      gameOver: false,
      gameStarted: false,
      level: 1,
      language: null,
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
  };

  const handleTimeout = () => {
    setGameState((prev) => ({
      ...prev,
      feedback: {
        message: "Time's up! Let's move to the next one.",
        isCorrect: false,
      },
    }));

    setTimeout(() => {
      if (gameState.currentIndex === LEVEL_ROUNDS[gameState.level] - 1) {
        setGameState((prev) => ({ ...prev, gameOver: true }));
      } else {
        setGameState((prev) => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          timeLeft: LEVEL_TIMES[prev.level],
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

    const currentSnippet = mockCodeSnippets[gameState.currentIndex % mockCodeSnippets.length];
    const isCorrect = isHot === currentSnippet.isValid;

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
      if (gameState.currentIndex === LEVEL_ROUNDS[gameState.level] - 1) {
        setGameState((prev) => ({
          ...prev,
          gameOver: true,
          confettiActive: prev.score + (isCorrect ? 1 : 0) === LEVEL_ROUNDS[prev.level],
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          timeLeft: LEVEL_TIMES[prev.level],
          feedback: { message: "", isCorrect: null },
          showPartyEmoji: false,
        }));
      }
    }, 1500);
  };

  const handleSkip = () => {
    if (gameState.currentIndex === LEVEL_ROUNDS[gameState.level] - 1) {
      setGameState((prev) => ({ ...prev, gameOver: true }));
    } else {
      setGameState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        timeLeft: LEVEL_TIMES[prev.level],
        feedback: { message: "", isCorrect: null },
      }));
    }
  };

  const handleLevelSelect = (selectedLevel: Level) => {
    setGameState((prev) => ({
      ...prev,
      level: selectedLevel,
      timeLeft: LEVEL_TIMES[selectedLevel],
      gameStarted: true,
    }));
  };

  if (!gameState.gameStarted) {
    return <LevelSelector onSelect={handleLevelSelect} isDarkMode={isDarkMode} />;
  }

  if (gameState.gameOver) {
    return (
      <GameResult
        score={gameState.score}
        total={LEVEL_ROUNDS[gameState.level]}
        onPlayAgain={resetGameState}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="space-y-8">
      <Timer
        timeLeft={gameState.timeLeft}
        total={LEVEL_TIMES[gameState.level]}
        isDarkMode={isDarkMode}
      />
      <CodeDisplay
        code={mockCodeSnippets[gameState.currentIndex % mockCodeSnippets.length].code}
        language={gameState.language || "typescript"}
        isDarkMode={isDarkMode}
      />
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
