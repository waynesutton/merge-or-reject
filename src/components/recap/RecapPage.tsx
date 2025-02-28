import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";

const RecapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default to dark mode

  // Fetch game recap data if id is provided
  const gameRecap = useQuery(api.games.getGameRecap, id ? { gameId: id } : "skip");

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

    darkModeMediaQuery.addEventListener("change", handleChange);
    return () => darkModeMediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!id || !gameRecap) {
    return (
      <div className="bg-[#000000] text-white min-h-screen">
        <Header isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
        <div className="max-w-4xl mx-auto py-10 px-4">
          <h1 className="text-3xl font-bold mb-6">Loading game recap...</h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className={isDarkMode ? " text-white min-h-screen" : "bg-white text-gray-900 min-h-screen"}>
      <Header isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <Link to="/" className="inline-flex items-center text-[#EE342F] mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Game Recap</h1>
        <div className="mb-6">
          <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            Language: {gameRecap.language} | Level: {gameRecap.level} | Score: {gameRecap.score}/
            {gameRecap.snippets.length}
          </p>
        </div>

        <div className="space-y-8">
          {gameRecap.snippets.map((snippet, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                snippet.correct
                  ? isDarkMode
                    ? "bg-green-950/30 border border-green-700"
                    : "bg-green-50 border border-green-200"
                  : isDarkMode
                    ? "bg-red-950/30 border border-red-700"
                    : "bg-red-50 border border-red-200"
              }`}>
              <div className="flex items-center mb-4">
                <span className="font-medium mr-2">Snippet {index + 1}:</span>
                {snippet.correct ? (
                  <span className="inline-flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Correct
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-600">
                    <XCircle className="w-4 h-4 mr-1" />
                    Incorrect
                  </span>
                )}
              </div>

              <div
                className={`p-4 rounded mb-4 font-mono text-sm ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                <pre className="whitespace-pre-wrap">{snippet.code}</pre>
              </div>

              <div>
                <p className="mb-2">
                  <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Snippet is{" "}
                  </span>
                  <span className={snippet.isValid ? "text-green-600" : "text-red-600"}>
                    {snippet.isValid ? "Valid" : "Invalid"}
                  </span>
                </p>

                <p className="mb-2">
                  <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Your answer:{" "}
                  </span>
                  <span
                    className={
                      snippet.userAnswer === snippet.isValid ? "text-green-600" : "text-red-600"
                    }>
                    {snippet.userAnswer ? "Merge" : "Reject"}
                  </span>
                </p>

                <div className={`mt-4 p-3 rounded ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                  <p
                    className={`font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Explanation:
                  </p>
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    {snippet.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecapPage;
