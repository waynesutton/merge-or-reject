/**
 * Header.tsx
 *
 * This component serves as the main header for the application.
 * It displays the app title and can return to the home page.
 *
 * Changes made:
 * - Created new Header component to fix missing header on homepage
 * - Added navigation capability to return to home page
 * - Made header responsive with dark mode support
 * - Added Merge logo with gradient text (2024-02-26)
 * - Added back scores, theme toggle, and admin logout buttons (2024-02-26)
 * - Fixed Clerk signOut method usage (2024-02-26)
 * - Made Clerk usage optional and only on home page (2024-03-14)
 */

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Code2, Trophy, Sun, Moon, LogOut } from "lucide-react";

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle?: () => void;
  clerk?: {
    signOut: () => Promise<void>;
    user: any;
  };
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onThemeToggle, clerk }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="mb-12">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-8 h-8 text-[#EE342F]" />
            <h1 className="text-2xl">
              <span className="text-[#ee342f]">M</span>
              <span className="text-[#f24723]">e</span>
              <span className="text-[#f75a18]">r</span>
              <span className="text-[#fb6c0c]">g</span>
              <span className="text-[#ff7f00]">e</span>
            </h1>
          </div>
        </button>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/scores")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}>
            <Trophy className={`w-5 h-5 ${isDarkMode ? "text-[#00FF94]" : "text-[#00CC77]"}`} />
            <span>Scores</span>
          </button>

          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}>
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-[#00FF94]" />
              ) : (
                <Moon className="w-5 h-5 text-[#00CC77]" />
              )}
            </button>
          )}

          {isHomePage && clerk?.user && (
            <button
              onClick={() => clerk.signOut()}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}>
              <LogOut className={`w-5 h-5 ${isDarkMode ? "text-[#00FF94]" : "text-[#00CC77]"}`} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
