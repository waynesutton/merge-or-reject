import React from "react";
import { Code2, Braces, FileCode, Terminal, Database } from "lucide-react";
import { Language, LANGUAGES } from "../types";

interface LanguageSelectorProps {
  onSelect: (language: Language) => void;
  onBack?: () => void;
  isDarkMode: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, onBack, isDarkMode }) => {
  const languages = Object.entries(LANGUAGES).map(([key, name]) => ({
    key: key as Language,
    name,
  }));

  const getLanguageIcon = (language: Language) => {
    switch (language) {
      case "typescript":
        return <Braces className="w-12 h-12 text-[#3178C6]" />;
      case "javascript":
        return <FileCode className="w-12 h-12 text-[#F7DF1E]" />;
      case "python":
        return <Terminal className="w-12 h-12 text-[#3776AB]" />;
      case "rust":
        return <Code2 className="w-12 h-12 text-[#000000] dark:text-[#FFFFFF]" />;
      case "go":
        return <Code2 className="w-12 h-12 text-[#00ADD8]" />;
      case "sql":
        return <Database className="w-12 h-12 text-[#4479A1]" />;
      default:
        return <Code2 className="w-12 h-12" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <p className="text-4xl font-normal">
        Are you smarter than AI?
        <span className={`text-sm ml-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          <p className="text-sm pt-5">VOL 1: You vs OpenAI gpt-4</p>
        </span>
      </p>
      <p className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-8`}>
        Select your language, review code snippets, and Merge (correct) or Reject (broken).<br></br>{" "}
        A perfect score = confetti!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map(({ key, name }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`group relative ${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} p-6 rounded-lg border-2 border-transparent hover:border-[#EE342F] transition-all duration-300 shadow-lg`}>
            <div className="flex justify-center mb-4">{getLanguageIcon(key)}</div>
            <h3 className="text-xl font-bold mb-2">{name}</h3>
            <div className="mt-4 text-sm text-[#EE342F] opacity-0 group-hover:opacity-100 transition-opacity">
              Click to start →
            </div>
          </button>
        ))}
      </div>
      {onBack && (
        <button
          onClick={onBack}
          className={`mt-8 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"} transition-colors`}>
          ← Back to Admin Dashboard
        </button>
      )}
    </div>
  );
};

export default LanguageSelector;
