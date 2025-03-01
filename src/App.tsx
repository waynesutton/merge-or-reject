import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ClerkProvider, useClerk } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import HomePage from "./components/HomePage";
import AdminDashboard from "./components/AdminDashboard";
import ScoresPage from "./components/ScoresPage";
import NotFoundPage from "./components/NotFoundPage";
import Footer from "./components/Footer";
import GameContainer from "./components/GameContainer";
import RecapPage from "./components/recap/RecapPage";
import { Language } from "./types";

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const initSettings = useMutation(api.settings.initializeSettings);

  // Initialize settings when app starts
  useEffect(() => {
    initSettings({ reset: false }).catch(console.error);
  }, [initSettings]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Handle language selection
  const handleLanguageSelect = (language: Language) => {
    navigate(`/game?language=${language}`);
  };

  // Wrap routes that need Clerk with ClerkProvider
  const ClerkWrappedRoute = ({ children }: { children: React.ReactNode }) => (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: isDarkMode ? "#00FF94" : "#00CC77",
          colorBackground: isDarkMode ? "#0f172a" : "#FFFFFF",
          colorText: isDarkMode ? "#FFFFFF" : "#000000",
        },
      }}>
      {children}
    </ClerkProvider>
  );

  // Component to pass Clerk instance to HomePage
  const HomePageWithClerk = () => {
    const clerk = useClerk();
    return (
      <HomePage
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        onLanguageSelect={handleLanguageSelect}
        clerk={clerk}
      />
    );
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-[#000000] to-[#1A1A1A] text-white"
            : "bg-white text-black"
        }`}>
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <ClerkWrappedRoute>
                  <HomePageWithClerk />
                </ClerkWrappedRoute>
              }
            />
            <Route
              path="/game"
              element={<GameContainer isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />}
            />
            <Route
              path="/admin"
              element={
                <ClerkWrappedRoute>
                  <AdminDashboard isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
                </ClerkWrappedRoute>
              }
            />
            <Route
              path="/scores"
              element={
                <ScoresPage
                  onBack={() => navigate("/")}
                  isDarkMode={isDarkMode}
                  onThemeToggle={handleThemeToggle}
                />
              }
            />
            <Route path="/recap/:slugId" element={<RecapPage />} />
            <Route
              path="*"
              element={<NotFoundPage isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />}
            />
          </Routes>
        </main>
      </div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;
