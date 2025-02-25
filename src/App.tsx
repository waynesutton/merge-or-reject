import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import HomePage from "./components/HomePage";
import AdminDashboard from "./components/AdminDashboard";
import ScoresPage from "./components/ScoresPage";
import NotFoundPage from "./components/NotFoundPage";
import Footer from "./components/Footer";
import GameContainer from "./components/GameContainer";

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const initSettings = useMutation(api.settings.initializeSettings);

  // Initialize settings when app starts
  useEffect(() => {
    initSettings().catch(console.error);
  }, [initSettings]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Wrap only the AdminDashboard route with ClerkProvider
  const AdminRoute = () => (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: isDarkMode ? "#00FF94" : "#00CC77",
          colorBackground: isDarkMode ? "#000000" : "#FFFFFF",
          colorText: isDarkMode ? "#FFFFFF" : "#000000",
        },
      }}>
      <AdminDashboard isDarkMode={isDarkMode} />
    </ClerkProvider>
  );

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className={`min-h-screen ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}>
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={<HomePage isDarkMode={isDarkMode} onLanguageSelect={() => {}} />}
            />
            <Route path="/game" element={<GameContainer isDarkMode={isDarkMode} />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route
              path="/scores"
              element={<ScoresPage onBack={() => navigate("/")} isDarkMode={isDarkMode} />}
            />
            <Route path="*" element={<NotFoundPage isDarkMode={isDarkMode} />} />
          </Routes>
        </main>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

export default App;
