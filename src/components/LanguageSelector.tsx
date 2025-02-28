import React, { useEffect, useState } from "react";
import { Code2, Braces, FileCode, Terminal, Database, Coffee, Hash, Settings } from "lucide-react";
import { Language, LANGUAGES } from "../types";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface LanguageSelectorProps {
  onSelect: (language: string) => void;
  onBack?: () => void;
  isDarkMode: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, onBack, isDarkMode }) => {
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [languageIcons, setLanguageIcons] = useState<Record<string, string>>({});

  // Fetch settings to get language volumes and their statuses
  const settings = useQuery(api.settings.getSettings);

  useEffect(() => {
    if (settings && settings.volumes) {
      // Filter to only include active languages
      const activeLanguages = settings.volumes
        .filter((vol) => vol.status === "active" || vol.status === undefined)
        .map((vol) => vol.language);

      setAvailableLanguages(activeLanguages);

      // Build a map of language keys to icon names
      const iconMap: Record<string, string> = {};
      settings.volumes.forEach((vol) => {
        if (vol.icon) {
          iconMap[vol.language] = vol.icon;
        }
      });
      setLanguageIcons(iconMap);
    }
  }, [settings]);

  const languages = availableLanguages.map((key) => ({
    key,
    name:
      settings?.volumes.find((vol) => vol.language === key)?.language ||
      key.charAt(0).toUpperCase() + key.slice(1),
  }));

  const getLanguageIcon = (language: Language) => {
    // Use the icon from the database if available
    const iconName = languageIcons[language];

    if (iconName) {
      switch (iconName) {
        case "Braces":
          return <Braces className="w-12 h-12 text-[#3178C6]" />;
        case "FileCode":
          return <FileCode className="w-12 h-12 text-[#F7DF1E]" />;
        case "Terminal":
          return <Terminal className="w-12 h-12 text-[#3776AB]" />;
        case "Settings":
          return <Settings className="w-12 h-12 text-[#000000] dark:text-[#FFFFFF]" />;
        case "Code2":
          return <Code2 className="w-12 h-12 text-[#00ADD8]" />;
        case "Database":
          return <Database className="w-12 h-12 text-[#4479A1]" />;
        case "Coffee":
          return <Coffee className="w-12 h-12 text-[#007396]" />;
        case "Hash":
          return <Hash className="w-12 h-12 text-[#00599C]" />;
        default:
          return <Code2 className="w-12 h-12" />;
      }
    }

    // Fall back to default mapping if no icon is specified
    switch (language) {
      case "typescript":
        return <Braces className="w-12 h-12 text-[#3178C6]" />;
      case "javascript":
        return <FileCode className="w-12 h-12 text-[#F7DF1E]" />;
      case "python":
        return <Terminal className="w-12 h-12 text-[#3776AB]" />;
      case "rust":
        return <Settings className="w-12 h-12 text-[#000000] dark:text-[#FFFFFF]" />;
      case "go":
        return <Code2 className="w-12 h-12 text-[#00ADD8]" />;
      case "sql":
        return <Database className="w-12 h-12 text-[#4479A1]" />;
      case "java":
        return <Coffee className="w-12 h-12 text-[#007396]" />;
      case "cpp":
        return <Hash className="w-12 h-12 text-[#00599C]" />;
      default:
        return <Code2 className="w-12 h-12" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <p className="text-4xl font-normal">
        Are you smarter than AI?
        <span className={`text-sm ml-2 text-[#EE342E]`}>
          <p className="text-lg pt-5">VOL 1: You vs OpenAI gpt-4</p>
        </span>
      </p>
      <p className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-8`}>
        Select your language, review code snippets, and Merge (correct) or Reject (broken).<br></br>{" "}
        Test your vibe coding skills against AI.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map(({ key, name }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`group relative ${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} p-6 rounded-lg border-2 border-transparent hover:border-[#EE342F] transition-all duration-300 shadow-lg`}>
            <div className="flex justify-center mb-4">{getLanguageIcon(key as Language)}</div>
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
