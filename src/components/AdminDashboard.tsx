/**
 * AdminDashboard.tsx
 *
 * Admin dashboard component that provides management interface for the application.
 *
 * Changes made:
 * - Added proper authentication handling with Clerk
 * - Added admin role verification
 * - Fixed type errors in API calls
 * - Added loading states for authentication
 * - Improved error handling for unauthorized access
 * - Added logout functionality
 * - Fixed user role checking with Clerk integration
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { useUser, SignedOut, RedirectToSignIn, useClerk } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import {
  ArrowLeft,
  Code2,
  Settings,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Bot,
} from "lucide-react";
import { LANGUAGES, LEVEL_TIMES, Language, Difficulty } from "../types";
import Header from "./Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Id } from "../../convex/_generated/dataModel";

interface AdminDashboardProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDarkMode, onThemeToggle }) => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState<"snippets" | "settings">("snippets");
  const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("typescript");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy");
  const [showAddSnippet, setShowAddSnippet] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    code: "",
    isValid: true,
    explanation: "",
    volume: 1,
    tags: [] as string[],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Check if user is admin
  const userRole = useQuery(api.users.getUserRole, {
    clerkId: user?.id ?? "",
  });

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Show error if not admin
  if (userRole !== "admin") {
    return (
      <>
        <Header isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} clerk={{ signOut, user }} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-8">You do not have administrator privileges.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors">
              Return Home
            </button>
          </div>
        </div>
      </>
    );
  }

  const AdminContent = () => {
    const settings = useQuery(api.settings.getSettings);
    const snippets = useQuery(api.snippets.getAdminSnippets, {
      language: selectedLanguage,
      difficulty: selectedDifficulty,
    });
    const addSnippetMutation = useMutation(api.snippets.addSnippet);
    const generateMoreSnippetsMutation = useMutation(api.snippets.generateMoreSnippets);
    const updateSettingsMutation = useMutation(api.settings.updateSettings);
    const createNewVolumeMutation = useMutation(api.settings.createNewVolume);
    const deleteSnippetMutation = useMutation(api.snippets.deleteSnippet);

    // Handle loading state
    if (!settings || !snippets) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Loading...</h1>
          </div>
        </div>
      );
    }

    const settingsData = settings || {
      settings: {
        timeLimits: {
          easy: 120,
          medium: 100,
          hard: 30,
        },
        snippetsPerGame: {
          easy: 3,
          medium: 5,
          hard: 7,
        },
        aiGeneration: {
          enabled: true,
          validRatio: 0.5,
          maxPerRequest: 5,
          minSnippetsBeforeGeneration: 5,
        },
      },
      volumes: [],
    };

    const snippetsData = snippets || [];

    const handleSettingsChange = (
      difficulty: Difficulty,
      field: "time" | "snippets",
      value: number
    ) => {
      if (!settingsData.settings) return;

      const newSettings = {
        timeLimits: { ...settingsData.settings.timeLimits },
        snippetsPerGame: { ...settingsData.settings.snippetsPerGame },
      };

      if (field === "time") {
        newSettings.timeLimits[difficulty] = value;
      } else {
        newSettings.snippetsPerGame[difficulty] = value;
      }

      updateSettingsMutation(newSettings);
    };

    const handleAddSnippet = async () => {
      try {
        await addSnippetMutation({
          language: selectedLanguage,
          volume: newSnippet.volume,
          code: newSnippet.code,
          isValid: newSnippet.isValid,
          difficulty: selectedDifficulty,
          explanation: newSnippet.explanation,
          tags: newSnippet.tags,
        });
        setShowAddSnippet(false);
        setNewSnippet({ code: "", isValid: true, explanation: "", volume: 1, tags: [] });
      } catch (error) {
        console.error("Error adding snippet:", error);
      }
    };

    const handleCreateNewVolume = async (language: Language) => {
      try {
        await createNewVolumeMutation({ language });
      } catch (error) {
        console.error("Error creating new volume:", error);
      }
    };

    const handleGenerateSnippets = async () => {
      setIsGenerating(true);
      setGenerationError(null);
      try {
        const volume =
          settingsData.volumes.find((v) => v.language === selectedLanguage)?.currentVolume || 1;
        await generateMoreSnippetsMutation({
          language: selectedLanguage,
          difficulty: selectedDifficulty,
          volume,
        });
      } catch (error: any) {
        setGenerationError(error?.message || "An error occurred while generating snippets");
      } finally {
        setIsGenerating(false);
      }
    };

    const handleDeleteSnippet = async (snippetId: string) => {
      try {
        await deleteSnippetMutation({ id: snippetId as Id<"codeSnippets"> });
        toast.success("Snippet deleted successfully");
      } catch (error) {
        toast.error("Failed to delete snippet");
      }
    };

    const renderAddSnippetModal = () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div
          className={`${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} p-6 rounded-lg max-w-3xl w-full mx-4`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl">Add New Snippet</h3>
            <button
              onClick={() => setShowAddSnippet(false)}
              className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                  className="w-full bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300">
                  {Object.entries(LANGUAGES).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Volume</label>
                <select
                  value={newSnippet.volume}
                  onChange={(e) =>
                    setNewSnippet((prev) => ({ ...prev, volume: parseInt(e.target.value) }))
                  }
                  className="w-full bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300">
                  {[
                    ...Array(
                      settingsData.volumes.find((v) => v.language === selectedLanguage)
                        ?.currentVolume || 1
                    ),
                  ].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Volume {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Code</label>
              <textarea
                value={newSnippet.code}
                onChange={(e) => setNewSnippet((prev) => ({ ...prev, code: e.target.value }))}
                className="w-full h-48 bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 font-mono"
                placeholder="Enter code snippet here..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newSnippet.isValid}
                  onChange={(e) =>
                    setNewSnippet((prev) => ({ ...prev, isValid: e.target.checked }))
                  }
                  className="rounded bg-black/30"
                />
                <span className="text-sm text-gray-300">Valid Code</span>
              </label>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Explanation</label>
              <textarea
                value={newSnippet.explanation}
                onChange={(e) =>
                  setNewSnippet((prev) => ({ ...prev, explanation: e.target.value }))
                }
                className="w-full h-24 bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300"
                placeholder="Explain why this code is valid/invalid..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowAddSnippet(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAddSnippet}
                className="px-4 py-2 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors">
                Add Snippet
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    const renderSettings = () => (
      <div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg mb-4">AI Generation</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settingsData.settings.aiGeneration.enabled}
                  onChange={(e) =>
                    updateSettingsMutation({
                      aiGeneration: {
                        ...settingsData.settings.aiGeneration,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="rounded bg-black/30"
                />
                <span className="text-sm text-gray-300">Enable AI Generation</span>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Valid/Invalid Ratio</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settingsData.settings.aiGeneration.validRatio}
                  onChange={(e) =>
                    updateSettingsMutation({
                      aiGeneration: {
                        ...settingsData.settings.aiGeneration,
                        validRatio: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>More Invalid</span>
                  <span>
                    {Math.round(settingsData.settings.aiGeneration.validRatio * 100)}% Valid
                  </span>
                  <span>More Valid</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Max Snippets per Generation
                  </label>
                  <input
                    type="number"
                    value={settingsData.settings.aiGeneration.maxPerRequest}
                    onChange={(e) =>
                      updateSettingsMutation({
                        aiGeneration: {
                          ...settingsData.settings.aiGeneration,
                          maxPerRequest: parseInt(e.target.value),
                        },
                      })
                    }
                    min="1"
                    max="10"
                    className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Min Snippets Before Generation
                  </label>
                  <input
                    type="number"
                    value={settingsData.settings.aiGeneration.minSnippetsBeforeGeneration}
                    onChange={(e) =>
                      updateSettingsMutation({
                        aiGeneration: {
                          ...settingsData.settings.aiGeneration,
                          minSnippetsBeforeGeneration: parseInt(e.target.value),
                        },
                      })
                    }
                    min="1"
                    max="20"
                    className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg mb-4">Language Volumes</h3>
            <div className="space-y-6">
              {Object.entries(LANGUAGES).map(([key, name]) => {
                const volume = settingsData.volumes.find((v) => v.language === key);
                return (
                  <div key={key} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[#00FF94]">{name}</h4>
                      <button
                        onClick={() => handleCreateNewVolume(key as Language)}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>New Volume</span>
                      </button>
                    </div>

                    {volume && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/20 p-4 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-400">Total Snippets</span>
                          <p className="text-xl">{volume.snippetCount}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">AI Generated</span>
                          <p className="text-xl">{volume.aiGeneratedCount}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Manual</span>
                          <p className="text-xl">{volume.snippetCount - volume.aiGeneratedCount}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Last Generation</span>
                          <p className="text-sm">
                            {new Date(volume.lastAiGeneration).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg mb-4">Game Configuration</h3>
            <div className="space-y-6">
              {Object.entries(settingsData.settings.timeLimits).map(([difficulty, time]) => (
                <div key={difficulty} className="space-y-4">
                  <h4 className="text-[#00FF94] capitalize">{difficulty}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Time Limit (seconds)
                      </label>
                      <input
                        type="number"
                        value={time}
                        onChange={(e) =>
                          handleSettingsChange(
                            difficulty as Difficulty,
                            "time",
                            parseInt(e.target.value)
                          )
                        }
                        className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Snippets per Game</label>
                      <input
                        type="number"
                        value={settingsData.settings.snippetsPerGame[difficulty as Difficulty]}
                        onChange={(e) =>
                          handleSettingsChange(
                            difficulty as Difficulty,
                            "snippets",
                            parseInt(e.target.value)
                          )
                        }
                        className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    const renderCodeSnippets = () => (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl">Code Snippets</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300">
              {Object.entries(LANGUAGES).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
              className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button
              onClick={handleGenerateSnippets}
              disabled={isGenerating || !settingsData.settings.aiGeneration.enabled}
              className={`flex items-center space-x-2 px-4 py-2 ${
                settingsData.settings.aiGeneration.enabled
                  ? "bg-[#00FF94] text-black hover:bg-[#00CC77]"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              } rounded-lg transition-colors`}>
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
              <span>Generate</span>
            </button>
            <button
              onClick={() => setShowAddSnippet(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Snippet</span>
            </button>
          </div>
        </div>

        {generationError && (
          <div className="mb-4 p-4 bg-red-900/50 text-red-400 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <p>{generationError}</p>
          </div>
        )}

        <div className="space-y-4">
          {snippetsData.map((snippet) => (
            <div key={snippet._id} className="bg-black/30 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[#00FF94] font-mono">{LANGUAGES[selectedLanguage]}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-400">Volume {snippet.volume}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-400">{selectedDifficulty}</span>
                    <span className="text-gray-400">·</span>
                    <span
                      className={`text-sm ${snippet.isValid ? "text-green-400" : "text-red-400"}`}>
                      {snippet.isValid ? "Valid" : "Invalid"}
                    </span>
                    {snippet.aiGenerated && (
                      <>
                        <span className="text-gray-400">·</span>
                        <span className="text-sm text-[#00FF94] flex items-center space-x-1">
                          <Bot className="w-3 h-3" />
                          <span>AI Generated</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSnippet(snippet._id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    onClick={() =>
                      setExpandedSnippet(expandedSnippet === snippet._id ? null : snippet._id)
                    }>
                    {expandedSnippet === snippet._id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {expandedSnippet === snippet._id && (
                <div className="border-t border-gray-800 p-4">
                  <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap mb-4">
                    {snippet.code}
                  </pre>
                  {snippet.explanation && (
                    <div className="mt-4 text-sm text-gray-400">
                      <strong>Explanation:</strong>
                      <p>{snippet.explanation}</p>
                    </div>
                  )}
                  {snippet.tags && snippet.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {snippet.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-black/30 text-gray-400 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className={`${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"} transition-colors`}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl">Admin Dashboard</h1>
          </div>
        </div>

        <div className="flex space-x-1 mb-8 bg-black/30 p-1 rounded-lg max-w-fit">
          <button
            onClick={() => setActiveTab("snippets")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "snippets"
                ? "bg-[#EE342F] text-black"
                : "text-gray-400 hover:text-white"
            }`}>
            <Code2 className="w-4 h-4" />
            <span>Snippets</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "settings"
                ? "bg-[#EE342F] text-black"
                : "text-gray-400 hover:text-white"
            }`}>
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        <div className="bg-[#1A1A1A] p-6 rounded-lg">
          {activeTab === "snippets" && renderCodeSnippets()}
          {activeTab === "settings" && renderSettings()}
        </div>

        {showAddSnippet && renderAddSnippetModal()}
      </div>
    );
  };

  return (
    <>
      <Header isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} clerk={{ signOut, user }} />
      <AdminContent />
    </>
  );
};

export default AdminDashboard;
