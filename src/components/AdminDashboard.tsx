import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
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
  Moon,
  Sun,
} from "lucide-react";
import { LANGUAGES, LEVEL_TIMES, Language, Difficulty } from "../types";
import Toaster from "./Toaster";

interface AdminDashboardProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDarkMode, onThemeToggle }) => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<"snippets" | "settings" | "analytics">("snippets");
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
  const [editingSnippet, setEditingSnippet] = useState<any | null>(null);
  const [showEditSnippet, setShowEditSnippet] = useState(false);

  // State for editing language volumes
  const [editingVolume, setEditingVolume] = useState<string | null>(null);
  const [volumeEditValue, setVolumeEditValue] = useState<number>(1);

  // Log authentication state for debugging
  useEffect(() => {
    console.log("Auth state:", { isLoaded, isSignedIn, userId: user?.id });
  }, [isLoaded, isSignedIn, user]);

  const AdminContent = () => {
    const settings = useQuery(api.settings.getSettings);
    const snippets = useQuery(api.snippets.getAdminSnippets, {
      language: selectedLanguage,
      difficulty: selectedDifficulty,
      clerkId: user?.id || "",
    } as any);
    const analytics = useQuery(api.admin.getAnalytics, {
      clerkId: user?.id || "",
    });
    const addSnippetMutation = useMutation(api.snippets.addSnippet);
    const generateMoreSnippetsMutation = useMutation(api.snippets.generateMoreSnippets);
    const updateSettingsMutation = useMutation(api.settings.updateSettings);
    const createNewVolumeMutation = useMutation(api.settings.createNewVolume);
    const deleteSnippetMutation = useMutation(api.snippets.deleteSnippet);
    const updateSnippetMutation = useMutation(api.snippets.updateSnippet);
    const updateLanguageVolumeMutation = useMutation(api.admin.updateLanguageVolume);

    // Handle unauthorized access or loading state
    if (!user?.id || !settings || !snippets) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-8">You do not have permission to access this page.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors">
              Return Home
            </button>
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

      updateSettingsMutation({
        ...newSettings,
        clerkId: user?.id,
      });
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
          clerkId: user?.id,
        });
        setShowAddSnippet(false);
        setNewSnippet({ code: "", isValid: true, explanation: "", volume: 1, tags: [] });
      } catch (error) {
        console.error("Error adding snippet:", error);
      }
    };

    const handleCreateNewVolume = async (language: Language) => {
      try {
        await createNewVolumeMutation({
          language,
          clerkId: user?.id,
        });
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
          clerkId: user?.id,
        });
      } catch (error: any) {
        setGenerationError(error.message || "An error occurred during generation");
      } finally {
        setIsGenerating(false);
      }
    };

    const handleDeleteSnippet = async (snippetId: string) => {
      try {
        await deleteSnippetMutation({
          id: snippetId as any,
          clerkId: user?.id,
        });
      } catch (error) {
        console.error("Error deleting snippet:", error);
      }
    };

    const handleEditSnippet = (snippet: any) => {
      setEditingSnippet(snippet);
      setShowEditSnippet(true);
    };

    const handleUpdateSnippet = async () => {
      try {
        await updateSnippetMutation({
          id: editingSnippet._id,
          code: editingSnippet.code,
          isValid: editingSnippet.isValid,
          explanation: editingSnippet.explanation,
          tags: editingSnippet.tags || [],
          clerkId: user?.id,
        });
        setShowEditSnippet(false);
        setEditingSnippet(null);
      } catch (error) {
        console.error("Error updating snippet:", error);
      }
    };

    const handleUpdateLanguageVolume = async (language: string) => {
      try {
        await updateLanguageVolumeMutation({
          language,
          currentVolume: volumeEditValue,
          clerkId: user?.id || "",
        });
        setEditingVolume(null);
      } catch (error) {
        console.error("Error updating language volume:", error);
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
                  className="w-full bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300"
                  id="add-snippet-language"
                  name="add-snippet-language">
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
                  className="w-full bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300"
                  id="add-snippet-difficulty"
                  name="add-snippet-difficulty">
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
                  className="w-full bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300"
                  id="add-snippet-volume"
                  name="add-snippet-volume">
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
                onInput={(e) =>
                  setNewSnippet((prev) => ({
                    ...prev,
                    code: (e.target as HTMLTextAreaElement).value,
                  }))
                }
                className="w-full h-48 bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 font-mono"
                placeholder="Enter code snippet here..."
                spellCheck="false"
                autoComplete="off"
                id="add-snippet-code"
                name="add-snippet-code"
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
                  id="add-snippet-valid"
                  name="add-snippet-valid"
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
                id="add-snippet-explanation"
                name="add-snippet-explanation"
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

    const renderEditSnippetModal = () => {
      if (!editingSnippet) return null;

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} p-6 rounded-lg max-w-3xl w-full mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl">Edit Snippet</h3>
              <button
                onClick={() => setShowEditSnippet(false)}
                className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Language</label>
                  <input
                    type="text"
                    value={
                      LANGUAGES[editingSnippet.language as keyof typeof LANGUAGES] ||
                      editingSnippet.language
                    }
                    disabled
                    className="w-full bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300"
                    id="edit-snippet-language"
                    name="edit-snippet-language"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                  <input
                    type="text"
                    value={editingSnippet.difficulty}
                    disabled
                    className="w-full bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300"
                    id="edit-snippet-difficulty"
                    name="edit-snippet-difficulty"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Volume</label>
                  <input
                    type="text"
                    value={editingSnippet.volume}
                    disabled
                    className="w-full bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300"
                    id="edit-snippet-volume"
                    name="edit-snippet-volume"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Code</label>
                <textarea
                  value={editingSnippet.code}
                  onChange={(e) => setEditingSnippet({ ...editingSnippet, code: e.target.value })}
                  className="w-full h-48 bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 font-mono"
                  placeholder="Enter code snippet here..."
                  spellCheck="false"
                  autoComplete="off"
                  id="edit-snippet-code"
                  name="edit-snippet-code"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingSnippet.isValid}
                    onChange={(e) =>
                      setEditingSnippet({ ...editingSnippet, isValid: e.target.checked })
                    }
                    className="rounded bg-black/30"
                    id="edit-snippet-valid"
                    name="edit-snippet-valid"
                  />
                  <span className="text-sm text-gray-300">Valid Code</span>
                </label>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Explanation</label>
                <textarea
                  value={editingSnippet.explanation}
                  onChange={(e) =>
                    setEditingSnippet({ ...editingSnippet, explanation: e.target.value })
                  }
                  className="w-full h-24 bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300"
                  placeholder="Explain why this code is valid/invalid..."
                  id="edit-snippet-explanation"
                  name="edit-snippet-explanation"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowEditSnippet(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSnippet}
                  className="px-4 py-2 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors">
                  Update Snippet
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };

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
                      clerkId: user?.id,
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
                      clerkId: user?.id,
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
                        clerkId: user?.id,
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
                        clerkId: user?.id,
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
              {settingsData.volumes.map((volume) => {
                const languageName =
                  LANGUAGES[volume.language as keyof typeof LANGUAGES] ||
                  volume.language.charAt(0).toUpperCase() + volume.language.slice(1);
                const isEditing = editingVolume === volume.language;

                return (
                  <div key={volume.language} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[#00FF94]">{languageName}</h4>
                      <div className="flex space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => setEditingVolume(null)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                            <button
                              onClick={() => handleUpdateLanguageVolume(volume.language)}
                              className="flex items-center space-x-2 px-4 py-2 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors">
                              <span>Save</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingVolume(volume.language);
                                setVolumeEditValue(volume.currentVolume);
                              }}
                              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleCreateNewVolume(volume.language as Language)}
                              className="flex items-center space-x-2 px-4 py-2 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors">
                              <Plus className="w-4 h-4" />
                              <span>New Volume</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className={`${isEditing ? "bg-black/40" : "bg-black/20"} p-4 rounded-lg`}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-400">Total Snippets</span>
                          <p className="text-xl">{volume.snippetCount}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Last Updated</span>
                          <p className="text-sm">
                            {new Date(volume.lastAiGeneration).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Current Volume</span>
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              value={volumeEditValue}
                              onChange={(e) =>
                                setVolumeEditValue(Math.max(1, parseInt(e.target.value) || 1))
                              }
                              className="w-full bg-black/30 px-2 py-1 rounded-lg text-lg text-white"
                            />
                          ) : (
                            <p className="text-xl">{volume.currentVolume}</p>
                          )}
                        </div>
                      </div>
                    </div>
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
                  <button
                    onClick={() => handleEditSnippet(snippet)}
                    className="p-2 text-gray-400 hover:text-white transition-colors">
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

    const renderAnalytics = () => {
      if (!analytics) {
        return (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF94]"></div>
          </div>
        );
      }

      const {
        totalUsers,
        totalGames,
        difficultySummary,
        volumeSummary,
        levelSummary,
        languageVolumes,
      } = analytics;

      // Helper function to format numbers
      const formatNumber = (num: number) => {
        return num % 1 === 0 ? num.toString() : num.toFixed(2);
      };

      return (
        <div className="space-y-8">
          {/* Overview Stats */}
          <div>
            <h3 className="text-lg mb-4">Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-black/30 p-6 rounded-lg">
                <h4 className="text-gray-400 text-sm mb-2">Total Users</h4>
                <p className="text-3xl text-[#00FF94] font-bold">{totalUsers}</p>
              </div>
              <div className="bg-black/30 p-6 rounded-lg">
                <h4 className="text-gray-400 text-sm mb-2">Total Games</h4>
                <p className="text-3xl text-[#00FF94] font-bold">{totalGames}</p>
              </div>
              <div className="bg-black/30 p-6 rounded-lg">
                <h4 className="text-gray-400 text-sm mb-2">Language Volumes</h4>
                <p className="text-3xl text-[#00FF94] font-bold">{languageVolumes.length}</p>
              </div>
            </div>
          </div>

          {/* Difficulty Stats */}
          <div>
            <h3 className="text-lg mb-4">Difficulty Summary</h3>
            <div className="bg-black/20 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/40">
                    <th className="text-left p-4 text-gray-300">Difficulty</th>
                    <th className="text-left p-4 text-gray-300">Games Played</th>
                    <th className="text-left p-4 text-gray-300">Average Score</th>
                  </tr>
                </thead>
                <tbody>
                  {difficultySummary.map((item, index) => (
                    <tr key={index} className="border-t border-gray-800">
                      <td className="p-4 capitalize">{item.difficulty}</td>
                      <td className="p-4">{item.count}</td>
                      <td className="p-4">{formatNumber(item.averageScore)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Volume Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Volume Summary */}
            <div>
              <h3 className="text-lg mb-4">Volume Summary</h3>
              <div className="bg-black/20 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black/40">
                      <th className="text-left p-4 text-gray-300">Volume</th>
                      <th className="text-left p-4 text-gray-300">Games Played</th>
                      <th className="text-left p-4 text-gray-300">Average Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volumeSummary.map((item, index) => (
                      <tr key={index} className="border-t border-gray-800">
                        <td className="p-4">{item.volume}</td>
                        <td className="p-4">{item.count}</td>
                        <td className="p-4">{formatNumber(item.averageScore)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Level Summary */}
            <div>
              <h3 className="text-lg mb-4">Level Summary</h3>
              <div className="bg-black/20 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black/40">
                      <th className="text-left p-4 text-gray-300">Level</th>
                      <th className="text-left p-4 text-gray-300">Games Played</th>
                      <th className="text-left p-4 text-gray-300">Average Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelSummary.map((item, index) => (
                      <tr key={index} className="border-t border-gray-800">
                        <td className="p-4">{item.level}</td>
                        <td className="p-4">{item.count}</td>
                        <td className="p-4">{formatNumber(item.averageScore)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Language Volumes */}
          <div>
            <h3 className="text-lg mb-4">Language Volumes</h3>
            <div className="bg-black/20 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/40">
                    <th className="text-left p-4 text-gray-300">Language</th>
                    <th className="text-left p-4 text-gray-300">Current Volume</th>
                    <th className="text-left p-4 text-gray-300">Total Snippets</th>
                  </tr>
                </thead>
                <tbody>
                  {languageVolumes.map((item, index) => (
                    <tr key={index} className="border-t border-gray-800">
                      <td className="p-4 capitalize">{item.language}</td>
                      <td className="p-4">{item.volumeCount}</td>
                      <td className="p-4">{item.snippetCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };

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
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "analytics"
                ? "bg-[#EE342F] text-black"
                : "text-gray-400 hover:text-white"
            }`}>
            <Sparkles className="w-4 h-4" />
            <span>Analytics</span>
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
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "settings" && renderSettings()}
        </div>

        {showAddSnippet && renderAddSnippetModal()}
        {showEditSnippet && renderEditSnippetModal()}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-600 text-white rounded">
            Back to Home
          </button>
          <button onClick={onThemeToggle} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Use Clerk components for auth protection */}
      <SignedIn>
        <AdminContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <Toaster />
    </div>
  );
};

export default AdminDashboard;
