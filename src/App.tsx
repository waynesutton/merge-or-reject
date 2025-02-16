import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Code2, Trophy, RefreshCw, ListOrdered, User, AlertTriangle, X, Sun, Moon } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import confetti from 'canvas-confetti';
import { PowerGlitch } from 'powerglitch';
import CodeDisplay from './components/CodeDisplay';
import { mockCodeSnippets } from './data/mockData';
import LevelSelector from './components/LevelSelector';
import Timer from './components/Timer';
import AdminDashboard from './components/AdminDashboard';
import HomePage from './components/HomePage';
import ScoresPage from './components/ScoresPage';
import ProfilePage from './components/ProfilePage';
import NotFoundPage from './components/NotFoundPage';
import Footer from './components/Footer';
import Notification from './components/Notification';
import { Level, Language, LEVEL_TIMES, LANGUAGES, BADGES, Badge } from './types';
import { mockProfile } from './data/mockProfile';
import GameResult from './components/GameResult';

function App() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const rejectButtonRef = useRef<HTMLButtonElement>(null);
  const glitchInstanceRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState<Level>(1);
  const [language, setLanguage] = useState<Language | null>(null);
  const [timeLeft, setTimeLeft] = useState(LEVEL_TIMES[1]);
  const [showScores, setShowScores] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean | null }>({
    message: '',
    isCorrect: null,
  });
  const [confettiActive, setConfettiActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => {});
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [showConvexBanner, setShowConvexBanner] = useState(true);
  const [showPartyEmoji, setShowPartyEmoji] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (rejectButtonRef.current && !glitchInstanceRef.current) {
      glitchInstanceRef.current = PowerGlitch.glitch(rejectButtonRef.current, {
        playMode: 'manual',
        createContainers: true,
        hideOverflow: false,
        timing: {
          duration: 1000,
        },
        glitchTimeSpan: {
          start: 0,
          end: 1
        },
        shake: {
          velocity: 15,
          amplitudeX: 0.2,
          amplitudeY: 0.2
        },
        slice: {
          count: 6,
          velocity: 15,
          minHeight: 0.02,
          maxHeight: 0.15,
          hueRotate: true
        }
      });
    }

    return () => {
      if (glitchInstanceRef.current) {
        glitchInstanceRef.current.stopGlitch();
        glitchInstanceRef.current = null;
      }
    };
  }, [rejectButtonRef.current]);

  const checkForNewBadges = (totalGames: number, currentBadges: string[]) => {
    const eligibleBadges = BADGES.filter(badge => 
      badge.requiredGames <= totalGames && !currentBadges.includes(badge.id)
    );
    
    if (eligibleBadges.length > 0) {
      setNewBadge(eligibleBadges[0]);
    }
  };

  const resetGameState = () => {
    setCurrentIndex(0);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setTimeLeft(LEVEL_TIMES[1]);
    setLevel(1);
    setLanguage(null);
    setFeedback({ message: '', isCorrect: null });
    setConfettiActive(false);
    setNewBadge(null);
  };

  const handleNavigationWarning = (action: () => void) => {
    if (gameStarted && !gameOver) {
      setShowWarning(true);
      setPendingNavigation(() => action);
      return true;
    }
    return false;
  };

  const handleHomeClick = () => {
    if (!handleNavigationWarning(() => {
      resetGameState();
      navigate('/');
    })) {
      resetGameState();
      navigate('/');
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameStarted && !gameOver) {
        e.preventDefault();
        e.returnValue = 'You have an active game session. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameStarted && !gameOver) {
        resetGameState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameStarted, gameOver]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameOver && !feedback.message) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, feedback.message]);

  useEffect(() => {
    if (confettiActive) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: NodeJS.Timer = setInterval(() => {
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
    }
  }, [confettiActive]);

  const handleTimeout = () => {
    setFeedback({
      message: "Time's up! Let's move to the next one.",
      isCorrect: false,
    });
    setTimeout(() => {
      if (currentIndex === mockCodeSnippets.length - 1) {
        setGameOver(true);
      } else {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(LEVEL_TIMES[level]);
        setFeedback({ message: '', isCorrect: null });
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

    const isCorrect = isHot === mockCodeSnippets[currentIndex].isValid;
    
    setFeedback({
      message: isCorrect 
        ? "Great job! You've got a keen eye for code!" 
        : "Oops! That wasn't quite right. Keep practicing!",
      isCorrect,
    });

    if (isCorrect && isHot) {
      setShowPartyEmoji(true);
      setTimeout(() => {
        setShowPartyEmoji(false);
        setTimeout(() => {
          setShowPartyEmoji(true);
          setTimeout(() => {
            setShowPartyEmoji(false);
          }, 500);
        }, 500);
      }, 500);
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex === mockCodeSnippets.length - 1) {
        setGameOver(true);
        if (score + (isCorrect ? 1 : 0) === 10) {
          setConfettiActive(true);
        }
      } else {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(LEVEL_TIMES[level]);
        setFeedback({ message: '', isCorrect: null });
      }
    }, 1500);
  };

  const handleLevelSelect = (selectedLevel: Level) => {
    setLevel(selectedLevel);
    setTimeLeft(LEVEL_TIMES[selectedLevel]);
    setGameStarted(true);
  };

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
  };

  const handleProfileClick = (playerName: string) => {
    if (gameStarted && !gameOver) {
      setShowWarning(true);
      setPendingNavigation(() => () => {
        resetGameState();
        setSelectedProfile(playerName);
        setShowProfile(true);
        setShowScores(false);
        setLanguage(null);
      });
      return;
    }
    setSelectedProfile(playerName);
    setShowProfile(true);
    setShowScores(false);
    setLanguage(null);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-gray-100 text-gray-900'} flex flex-col`}>
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white'} p-6 rounded-lg max-w-md w-full mx-4`}>
            <div className="flex items-center space-x-3 text-yellow-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-xl">Warning</h3>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              You have an active game session. Leaving now will reset your progress. Are you sure you want to continue?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowWarning(false);
                  setPendingNavigation(() => {});
                }}
                className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-colors`}
              >
                Stay
              </button>
              <button
                onClick={() => {
                  setShowWarning(false);
                  pendingNavigation();
                  setPendingNavigation(() => {});
                }}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {newBadge && (
        <Notification
          badge={newBadge}
          onClose={() => setNewBadge(null)}
        />
      )}

      {showConvexBanner && (
        <div className={`fixed right-4 bottom-4 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} py-2 px-4 rounded-lg shadow-lg z-40 flex items-center`}>
          <span className="mr-3">Powered by Convex</span>
          <button
            onClick={() => setShowConvexBanner(false)}
            className="hover:text-gray-400 transition-colors"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleHomeClick}
              className="flex items-center space-x-2 hover:text-[#EE342F] transition-colors"
            >
              <Code2 className="w-8 h-8 text-[#EE342F]" />
              <h1 className="text-2xl">Merge or Reject</h1>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {gameStarted && (
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-[#EE342F]" />
                  <span className="text-lg">Score: {score}</span>
                </div>
              )}
              <button
                onClick={() => {
                  if (!handleNavigationWarning(() => {
                    resetGameState();
                    navigate('/profile');
                  })) {
                    navigate('/profile');
                  }
                }}
                className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors flex items-center space-x-1`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  if (!handleNavigationWarning(() => {
                    resetGameState();
                    navigate('/scores');
                  })) {
                    navigate('/scores');
                  }
                }}
                className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors flex items-center space-x-1`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>Scores</span>
              </button>
              {isSignedIn ? (
                <>
                  <UserButton afterSignOutUrl="/" />
                  {user?.publicMetadata.role === 'admin' && (
                    <button
                      onClick={() => {
                        if (!handleNavigationWarning(() => {
                          resetGameState();
                          navigate('/admin');
                        })) {
                          navigate('/admin');
                        }
                      }}
                      className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
                    >
                      Admin
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <SignInButton mode="modal">
                    <button className="text-sm text-[#EE342F] hover:text-[#D42D29] transition-colors">
                      Log in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="text-sm bg-[#EE342F] text-white px-4 py-2 rounded-lg hover:bg-[#D42D29] transition-colors">
                      Sign up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex-grow">
        <Routes>
          <Route path="/" element={
            !language ? (
              <HomePage onLanguageSelect={(selectedLanguage) => {
                if (!isSignedIn) {
                  const signInButton = document.querySelector('[data-clerk-sign-in]') as HTMLElement;
                  if (signInButton) {
                    signInButton.click();
                  }
                  return;
                }
                setLanguage(selectedLanguage);
              }} onProfileClick={handleProfileClick} isDarkMode={isDarkMode} />
            ) : !gameStarted ? (
              <LevelSelector onSelect={handleLevelSelect} onBack={() => setLanguage(null)} isDarkMode={isDarkMode} />
            ) : !gameOver ? (
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl">Round {currentIndex + 1}/10</h2>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Merge or reject this code?</span>
                  </div>
                  
                  <CodeDisplay code={mockCodeSnippets[currentIndex].code} isDarkMode={isDarkMode} />

                  <Timer timeLeft={timeLeft} totalTime={LEVEL_TIMES[level]} />

                  {feedback.message && (
                    <div className={`mt-4 p-4 rounded-lg text-center ${
                      feedback.isCorrect 
                        ? 'bg-green-900/50 text-green-400' 
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {feedback.message}
                    </div>
                  )}

                  <div className="flex justify-center space-x-6 mt-8">
                    <button
                      ref={rejectButtonRef}
                      onClick={() => handleVote(false)}
                      disabled={!!feedback.message}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-[#D50000] text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                    <div className="relative">
                      {showPartyEmoji && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce">
                          🎉
                        </div>
                      )}
                      <button
                        onClick={() => handleVote(true)}
                        disabled={!!feedback.message}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span>Merge</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <GameResult
                score={score}
                language={LANGUAGES[language]}
                level={level}
                volume={1}
                onPlayAgain={resetGameState}
                isDarkMode={isDarkMode}
              />
            )
          } />
          <Route path="/admin" element={<AdminDashboard isDarkMode={isDarkMode} />} />
          <Route path="/scores" element={<ScoresPage onBack={() => navigate('/')} onProfileClick={handleProfileClick} isDarkMode={isDarkMode} />} />
          <Route path="/profile" element={
            !isSignedIn ? (
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl">Please Sign In</h1>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>You need to be signed in to view your profile.</p>
                <SignInButton mode="modal">
                  <button className="text-[#EE342F] hover:text-[#D42D29] transition-colors">
                    Log in
                  </button>
                </SignInButton>
              </div>
            ) : (
              <ProfilePage profile={mockProfile} onBack={() => navigate('/')} isDarkMode={isDarkMode} />
            )
          } />
          <Route path="*" element={<NotFoundPage isDarkMode={isDarkMode} />} />
        </Routes>
      </main>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;