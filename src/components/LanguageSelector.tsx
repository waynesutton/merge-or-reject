/**
 * LanguageSelector.tsx
 *
 * Changes made:
 * - Removed dependency on default LANGUAGES object
 * - Updated language name resolution to only use database settings
 * - Added proper type for language volumes from database
 * - Improved error handling for missing language names
 * - Maintained all existing UI and functionality
 * - Added support for custom icon colors from database
 */

import React, { useEffect, useState } from "react";
import {
  Code2,
  Braces,
  FileCode,
  Terminal,
  Database,
  Coffee,
  Hash,
  Settings,
  Worm,
} from "lucide-react";
import { Language } from "../types";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ConvexNudge } from "@convex-nudge/react";

interface LanguageSelectorProps {
  onSelect: (language: string) => void;
  onBack?: () => void;
  isDarkMode: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, onBack, isDarkMode }) => {
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [languageIcons, setLanguageIcons] = useState<Record<string, string>>({});
  const [languageIconColors, setLanguageIconColors] = useState<Record<string, string>>({});

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

      // Build maps of language keys to icon names and colors
      const iconMap: Record<string, string> = {};
      const colorMap: Record<string, string> = {};
      settings.volumes.forEach((vol) => {
        if (vol.icon) {
          iconMap[vol.language] = vol.icon;
        }
        if (vol.iconColor) {
          colorMap[vol.language] = vol.iconColor;
        }
      });
      setLanguageIcons(iconMap);
      setLanguageIconColors(colorMap);
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
    const iconColor = languageIconColors[language] || "#FFFFFF"; // Default to white if no color set

    // Create the style object for the icon color
    const iconStyle = { color: iconColor };

    // Return the appropriate icon component based on the icon name
    switch (iconName) {
      case "Braces":
        return <Braces className="w-12 h-12" style={iconStyle} />;
      case "FileCode":
        return <FileCode className="w-12 h-12" style={iconStyle} />;
      case "Terminal":
        return <Terminal className="w-12 h-12" style={iconStyle} />;
      case "Settings":
        return <Settings className="w-12 h-12" style={iconStyle} />;
      case "Database":
        return <Database className="w-12 h-12" style={iconStyle} />;
      case "Coffee":
        return <Coffee className="w-12 h-12" style={iconStyle} />;
      case "Hash":
        return <Hash className="w-12 h-12" style={iconStyle} />;
      case "Worm":
        return <Worm className="w-12 h-12" style={iconStyle} />;
      case "Code2":
      default:
        return <Code2 className="w-12 h-12" style={iconStyle} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <p className="text-4xl font-normal">
        Tinder but for code reviews. "The Game"<br></br>
        <span className={`text-sm ml-2 text-[#EE342E]`}>
          <span className="text-lg pt-5">
            {/*  <span className="text-[#ffffff]">Test your vibe coding skills against AI. </span>  */}
            VOL 1: Challenge OpenAI gpt-4
          </span>
        </span>
      </p>
      <p className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-8`}>
        <span className="text-[#ffffff]">
          Evaluate code snippets: swipe right to <span className="text-[#17A34A]">Merge</span>{" "}
          (valid) or left to <span className="text-[#EE342E]">Reject</span> (invalid) on mobile.{" "}
          <br />
          On desktop, use keyboard shortcuts for faster review to play Merge.
        </span>
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
