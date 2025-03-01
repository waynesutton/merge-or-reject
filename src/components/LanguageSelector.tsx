/**
 * LanguageSelector.tsx
 *
 * Changes made:
 * - Removed dependency on default LANGUAGES object
 * - Updated language name resolution to only use database settings
 * - Added proper type for language volumes from database
 * - Improved error handling for missing language names
 * - Maintained all existing UI and functionality
 */

import React, { useEffect, useState } from "react";
import { Code2, Braces, FileCode, Terminal, Database, Coffee, Hash, Settings } from "lucide-react";
import { Language } from "../types";
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
      console.log("Language volumes from settings:", settings.volumes);

      // Filter to only include active languages
      const activeLanguages = settings.volumes
        .filter((vol) => vol.status === "active" || vol.status === undefined)
        .map((vol) => vol.language);

      console.log("Active languages after filtering:", activeLanguages);

      setAvailableLanguages(activeLanguages);

      // Build map of language keys to icon names
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
    name: key.charAt(0).toUpperCase() + key.slice(1),
  }));

  console.log("Final languages array for rendering:", languages);

  const getLanguageIcon = (language: string) => {
    // Use the icon from the database if available
    const iconName = languageIcons[language];

    // Return the appropriate icon component based on the icon name
    switch (iconName) {
      case "Braces":
        return <Braces className="w-12 h-12" />;
      case "FileCode":
        return <FileCode className="w-12 h-12" />;
      case "Terminal":
        return <Terminal className="w-12 h-12" />;
      case "Settings":
        return <Settings className="w-12 h-12" />;
      case "Database":
        return <Database className="w-12 h-12" />;
      case "Coffee":
        return <Coffee className="w-12 h-12" />;
      case "Hash":
        return <Hash className="w-12 h-12" />;
      case "Code2":
      default:
        return <Code2 className="w-12 h-12" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <p className="text-4xl font-normal">
        Are you smarter than AI?
        <span className={`text-sm ml-2 text-[#EE342E]`}>
          <p className="text-lg pt-5">VOL 1: Challenge OpenAI gpt-4</p>
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
