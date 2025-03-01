import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  Braces,
  FileCode,
  Terminal,
  Coffee,
  Hash,
  Database,
  Server,
  FileJson,
  FileCog,
  Cpu,
  LayoutTemplate,
  Worm,
} from "lucide-react";
import { LEVEL_TIMES, Language, Difficulty } from "../types";
import Toaster from "./Toaster";

interface AdminDashboardProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

interface LanguageVolume {
  language: string;
  currentVolume: number;
  snippetCount: number;
  aiGeneratedCount: number;
  lastAiGeneration: string;
  status: "active" | "paused" | "removed";
  icon?: string;
  iconColor?: string;
  displayName?: string;
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
  const [editingVolume, setEditingVolume] = useState<string | null>(null);
  const [volumeEditValue, setVolumeEditValue] = useState<number>(1);
  const [newLanguage, setNewLanguage] = useState({
    key: "",
    displayName: "",
    icon: "Code2", // Default icon
    iconColor: "#FFFFFF", // Add default icon color
  });
  const [editingIcon, setEditingIcon] = useState<string | null>(null);
  const [iconEditValue, setIconEditValue] = useState<string>("Code2");
  const [selectedVolume, setSelectedVolume] = useState<number>(1);
  const [languageVolumes, setLanguageVolumes] = useState<LanguageVolume[]>([]);

  // Add refs for inputs to maintain focus
  const languageKeyRef = useRef<HTMLInputElement>(null);
  const displayNameRef = useRef<HTMLInputElement>(null);
  const iconSelectRef = useRef<HTMLSelectElement>(null);
  const iconEditSelectRef = useRef<HTMLSelectElement>(null);
  const volumeEditRef = useRef<HTMLInputElement>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  const explanationEditorRef = useRef<HTMLTextAreaElement>(null);

  // Add more refs
  const editSnippetCodeRef = useRef<HTMLTextAreaElement>(null);
  const editSnippetExplanationRef = useRef<HTMLTextAreaElement>(null);

  // Available Lucide icons for languages
  const availableIcons = [
    {
      name: "Braces",
      component: <Braces className="w-5 h-5" />,
    },
    {
      name: "FileCode",
      component: <FileCode className="w-5 h-5" />,
    },
    {
      name: "Terminal",
      component: <Terminal className="w-5 h-5" />,
    },
    {
      name: "Settings",
      component: <Settings className="w-5 h-5" />,
    },
    {
      name: "Code2",
      component: <Code2 className="w-5 h-5" />,
    },
    {
      name: "Database",
      component: <Database className="w-5 h-5" />,
    },
    {
      name: "Coffee",
      component: <Coffee className="w-5 h-5" />,
    },
    { name: "Hash", component: <Hash className="w-5 h-5" /> },
    { name: "Worm", component: <Worm className="w-5 h-5" /> },
  ];

  // Function to get colored icon component
  const getColoredIcon = (iconName: string, color: string) => {
    const iconData = availableIcons.find((icon) => icon.name === iconName);
    if (!iconData) return null;

    // Clone the icon element with the specified color
    return React.cloneElement(iconData.component, { style: { color } });
  };

  // Use refs to track initialization status
  const snippetCountsInitialized = useRef(false);
  const volumesInitialized = useRef(false);

  // Track previous volumes for comparison
  const prevVolumesRef = useRef<string | null>(null);

  // Define updateSnippetCountsMutation at the component level
  const updateSnippetCountsMutation = useMutation(api.admin.updateSnippetCounts);
  // Define addTestSnippetsMutation at the component level
  const addTestSnippetsMutation = useMutation(api.testData.addTestSnippets);

  // Define settings at the component level for the useEffect
  const settings = useQuery(api.settings.getSettings);

  // Add useEffect to update snippet counts on load - runs only once
  useEffect(() => {
    if (user?.id && !snippetCountsInitialized.current) {
      snippetCountsInitialized.current = true;
      updateSnippetCountsMutation({ clerkId: user.id });
    }
  }, [user?.id, updateSnippetCountsMutation]);

  // Update languageVolumes state when settings or languages change - with safety checks
  useEffect(() => {
    if (settings?.volumes) {
      // Stringify for deep comparison
      const currentVolumesJson = JSON.stringify(settings.volumes);

      // Only update if the data actually changed
      if (currentVolumesJson !== prevVolumesRef.current) {
        prevVolumesRef.current = currentVolumesJson;

        // Cast to satisfy TypeScript
        setLanguageVolumes(settings.volumes as any);
      }
    }
  }, [settings?.volumes]);

  // Add memoized handlers for select changes
  const handleLanguageSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedLanguage(e.target.value as Language);
  }, []);

  const handleDifficultySelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDifficulty(e.target.value as Difficulty);
  }, []);

  const handleSnippetVolumeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const value = parseInt(e.target.value);
    setNewSnippet((prev) => ({ ...prev, volume: value }));
  }, []);

  const handleSnippetIsValidChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const checked = e.target.checked;
    setNewSnippet((prev) => ({ ...prev, isValid: checked }));
  }, []);

  const handleEditSnippetIsValidChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const checked = e.target.checked;
    setEditingSnippet((prev: any) => ({ ...prev, isValid: checked }));
  }, []);

  // Update handlers to prevent focus loss
  const handleLanguageKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    setNewLanguage((prev) => ({ ...prev, key: value }));
  }, []);

  const handleDisplayNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    setNewLanguage((prev) => ({ ...prev, displayName: value }));
  }, []);

  const handleIconChange = (language: string, icon: string) => {
    setLanguageVolumes((prev) =>
      prev.map((v) => {
        if (v.language === language) {
          return { ...v, icon } as any;
        }
        return v;
      })
    );
    setIconEditValue("");
  };

  const handleIconEditChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    setIconEditValue(value);
  }, []);

  const handleEditingSnippetChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    setEditingSnippet((prev: any) => ({ ...prev, code: value }));
  }, []);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    setNewSnippet((prev) => ({ ...prev, code: value }));
  }, []);

  const handleExplanationChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    setNewSnippet((prev) => ({ ...prev, explanation: value }));
  }, []);

  const handleVolumeEditChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setVolumeEditValue(value);
  }, []);

  // Update the edit snippet handlers
  const handleEditingExplanationChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();
      const value = e.target.value;
      setEditingSnippet((prev: any) => ({ ...prev, explanation: value }));
    },
    []
  );

  // Add additional CSS classes where needed
  const focusClasses = "focus:outline-none focus:ring-1 focus:ring-[#00FF94]";

  // Add volume change handler
  const handleVolumeSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    setSelectedVolume(parseInt(e.target.value));
  }, []);

  const handleIconColorChange = (language: string, color: string) => {
    setLanguageVolumes((prev) =>
      prev.map((v) => {
        if (v.language === language) {
          return { ...v, iconColor: color } as any;
        }
        return v;
      })
    );
  };

  // Add back the original handleIconChange function for newLanguage
  const handleNewLanguageIconChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    setNewLanguage((prev) => ({ ...prev, icon: value }));
  }, []);

  const AdminContent = () => {
    const languages = useQuery(api.admin.getLanguages) as LanguageVolume[] | undefined;
    const snippets = useQuery(api.snippets.getAdminSnippets, {
      language: selectedLanguage,
      difficulty: selectedDifficulty,
      volume: selectedVolume,
      clerkId: user?.id || "",
    });
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
    const updateLanguageStatusMutation = useMutation(api.admin.updateLanguageStatus);
    const addLanguageVolumeMutation = useMutation(api.admin.addLanguageVolume);
    const updateLanguageIconMutation = useMutation(api.admin.updateLanguageIcon);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState("");

    // Optimize useQuery with useMemo to prevent unnecessary re-renders
    const snippetsQueryArgs = useMemo(
      () => ({
        language: selectedLanguage,
        difficulty: selectedDifficulty,
        volume: selectedVolume,
        clerkId: user?.id || "",
      }),
      [selectedLanguage, selectedDifficulty, selectedVolume, user?.id]
    );

    const analyticsQueryArgs = useMemo(
      () => ({
        clerkId: user?.id || "",
      }),
      [user?.id]
    );

    // Use the memoized query arguments
    const memoizedSnippets = useQuery(api.snippets.getAdminSnippets, snippetsQueryArgs);
    const memoizedAnalytics = useQuery(api.admin.getAnalytics, analyticsQueryArgs);

    // Use the memoized queries instead of the original ones
    const snippetsData = memoizedSnippets || [];
    const analyticsData = memoizedAnalytics;

    // Move all useCallback hooks to the top level
    const handleAiEnabledChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        if (settings?.settings) {
          updateSettingsMutation({
            aiGeneration: {
              ...settings.settings.aiGeneration,
              enabled: checked,
            },
            clerkId: user?.id || "",
          });
        }
      },
      [updateSettingsMutation, settings?.settings, user?.id]
    );

    const handleValidRatioChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (settings?.settings) {
          updateSettingsMutation({
            aiGeneration: {
              ...settings.settings.aiGeneration,
              validRatio: value,
            },
            clerkId: user?.id || "",
          });
        }
      },
      [updateSettingsMutation, settings?.settings, user?.id]
    );

    const handleMaxPerRequestChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (settings?.settings) {
          updateSettingsMutation({
            aiGeneration: {
              ...settings.settings.aiGeneration,
              maxPerRequest: value,
            },
            clerkId: user?.id || "",
          });
        }
      },
      [updateSettingsMutation, settings?.settings, user?.id]
    );

    const handleMinSnippetsChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (settings?.settings) {
          updateSettingsMutation({
            aiGeneration: {
              ...settings.settings.aiGeneration,
              minSnippetsBeforeGeneration: value,
            },
            clerkId: user?.id || "",
          });
        }
      },
      [updateSettingsMutation, settings?.settings, user?.id]
    );

    const handleSettingsChangePreventDefault = useCallback(
      (
        e: React.ChangeEvent<HTMLInputElement>,
        difficulty: Difficulty,
        field: "time" | "snippets"
      ) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && settings?.settings) {
          const newSettings = {
            timeLimits: { ...settings.settings.timeLimits },
            snippetsPerGame: { ...settings.settings.snippetsPerGame },
          };

          if (field === "time") {
            newSettings.timeLimits[difficulty] = value;
          } else {
            newSettings.snippetsPerGame[difficulty] = value;
          }

          updateSettingsMutation({
            ...newSettings,
            clerkId: user?.id || "",
          });
        }
      },
      [updateSettingsMutation, settings?.settings, user?.id]
    );

    // Helper function to capitalize first letter
    const capitalizeFirstLetter = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    // Handle unauthorized access or loading state
    if (!user?.id || !settings || !snippetsData) {
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
        // Get the current icon and icon color for this language
        const volume = settingsData.volumes.find((vol) => vol.language === language);
        const icon = volume?.icon || "Code2"; // Use existing icon or default to Code2
        const iconColor = (volume as any)?.iconColor || "#FFFFFF"; // Use existing color or default to white

        await createNewVolumeMutation({
          language,
          clerkId: user?.id || "",
          icon,
          iconColor,
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
      const volume = languageVolumes.find((v) => v.language === language);
      if (volume) {
        try {
          // Cast to any to work around TypeScript type issues
          const params: any = {
            language,
            currentVolume: volume.currentVolume,
            status: volume.status || "active",
            iconColor: volume.iconColor || "#FFFFFF",
            clerkId: user?.id || "",
          };

          await updateLanguageVolumeMutation(params);
          setEditingVolume(null);
        } catch (error) {
          console.error("Error updating language volume:", error);
        }
      }
    };

    const handleUpdateLanguageStatus = async (
      language: string,
      status: "active" | "paused" | "removed"
    ) => {
      try {
        await updateLanguageStatusMutation({
          language,
          status,
          clerkId: user?.id || "",
        });
      } catch (error) {
        console.error("Error updating language status:", error);
      }
    };

    const handleAddLanguage = async () => {
      if (newLanguage.key && newLanguage.displayName) {
        try {
          // Cast to any to work around TypeScript type issues
          const params: any = {
            language: newLanguage.key.toLowerCase(),
            displayName: newLanguage.displayName,
            icon: newLanguage.icon,
            iconColor: newLanguage.iconColor,
            clerkId: user?.id || "",
          };

          await addLanguageVolumeMutation(params);
          setNewLanguage({ key: "", displayName: "", icon: "Code2", iconColor: "#FFFFFF" });
        } catch (error) {
          console.error("Error adding language:", error);
        }
      }
    };

    const handleUpdateSnippetCounts = async () => {
      try {
        if (!user?.id) return;
        setIsUpdating(true);
        await updateSnippetCountsMutation({ clerkId: user.id });
        setUpdateMessage("Snippet counts updated successfully");
        setTimeout(() => setUpdateMessage(""), 3000);
      } catch (error) {
        console.error("Error updating snippet counts:", error);
        setUpdateMessage("Error updating snippet counts");
      } finally {
        setIsUpdating(false);
      }
    };

    const handleAddTestSnippets = async () => {
      try {
        if (!user?.id) return;
        setIsUpdating(true);
        setUpdateMessage("Adding test snippets...");
        const result = await addTestSnippetsMutation({ clerkId: user.id });
        setUpdateMessage(
          `Added ${result.addedCount} test snippets for ${result.languages.join(", ")}`
        );
        setTimeout(() => setUpdateMessage(""), 5000);
      } catch (error) {
        console.error("Error adding test snippets:", error);
        setUpdateMessage("Error adding test snippets");
      } finally {
        setIsUpdating(false);
      }
    };

    const handleUpdateLanguageIcon = async (language: string, iconColor?: string) => {
      try {
        // Find the current language volume to get the current color if not provided
        const volume = languageVolumes.find((v) => v.language === language);
        const colorToUse = iconColor || (volume as any)?.iconColor || "#FFFFFF";

        // Update the params to include iconColor now that schema supports it
        const params = {
          language,
          icon: iconEditValue,
          iconColor: colorToUse, // Add iconColor parameter
          clerkId: user?.id || "",
        };

        await updateLanguageIconMutation(params);
        setEditingIcon(null);
      } catch (error) {
        console.error("Error updating language icon:", error);
      }
    };

    const handleUpdateLanguageIconColor = async (language: string, newColor: string) => {
      try {
        // Find the current language volume
        const volume = languageVolumes.find((v) => v.language === language);
        if (volume) {
          // Update the local state first for immediate feedback
          setLanguageVolumes((prev) =>
            prev.map((v) => {
              if (v.language === language) {
                return { ...v, iconColor: newColor } as any;
              }
              return v;
            })
          );

          // Then update in the database - include iconColor now that the schema supports it
          const params = {
            language,
            icon: volume.icon || "Code2", // Use current icon
            iconColor: newColor, // Now included in the schema
            clerkId: user?.id || "",
          };

          await updateLanguageIconMutation(params);
        }
      } catch (error) {
        console.error("Error updating language icon color:", error);
      }
    };

    const renderAddSnippetModal = () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div
          className={`${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} p-6 rounded-lg max-w-3xl w-full mx-4`}
          onClick={(e) => e.stopPropagation()}>
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
                  onChange={handleLanguageSelectChange}
                  onClick={(e) => e.stopPropagation()}
                  className={`bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 ${focusClasses}`}
                  id="language-filter"
                  name="language-filter">
                  {languages?.map((lang: LanguageVolume) => (
                    <option key={lang.language} value={lang.language}>
                      {capitalizeFirstLetter(lang.language)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={handleDifficultySelectChange}
                  onClick={(e) => e.stopPropagation()}
                  className={`bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 ${focusClasses}`}
                  id="difficulty-filter"
                  name="difficulty-filter">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Volume</label>
                <select
                  value={newSnippet.volume}
                  onChange={handleSnippetVolumeChange}
                  onClick={(e) => e.stopPropagation()}
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
                onChange={handleCodeChange}
                onClick={(e) => e.stopPropagation()}
                ref={codeEditorRef}
                className={`w-full h-48 bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 font-mono ${focusClasses}`}
                placeholder="Enter code snippet here..."
                id="add-snippet-code"
                name="add-snippet-code"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newSnippet.isValid}
                  onChange={handleSnippetIsValidChange}
                  onClick={(e) => e.stopPropagation()}
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
                onChange={handleExplanationChange}
                onClick={(e) => e.stopPropagation()}
                ref={explanationEditorRef}
                className={`w-full h-24 bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 ${focusClasses}`}
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
            className={`${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} p-6 rounded-lg max-w-3xl w-full mx-4`}
            onClick={(e) => e.stopPropagation()}>
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
                      languages?.find((lang) => lang.language === editingSnippet.language)
                        ?.language || editingSnippet.language
                    }
                    disabled
                    onClick={(e) => e.stopPropagation()}
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
                    onClick={(e) => e.stopPropagation()}
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
                    onClick={(e) => e.stopPropagation()}
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
                  onChange={handleEditingSnippetChange}
                  onClick={(e) => e.stopPropagation()}
                  ref={editSnippetCodeRef}
                  className={`w-full h-64 font-mono text-xs bg-black/30 p-4 rounded-lg text-gray-300 ${focusClasses}`}
                  id="edit-snippet-code"
                  name="edit-snippet-code"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingSnippet.isValid}
                    onChange={handleEditSnippetIsValidChange}
                    onClick={(e) => e.stopPropagation()}
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
                  onChange={handleEditingExplanationChange}
                  onClick={(e) => e.stopPropagation()}
                  ref={editSnippetExplanationRef}
                  className={`w-full h-24 bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 ${focusClasses}`}
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

    const renderSettings = () => {
      return (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Settings
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleUpdateSnippetCounts}
                disabled={isUpdating}
                className={`px-4 py-2 text-white rounded ${
                  isUpdating ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                }`}>
                {isUpdating ? "Updating..." : "Update Snippet Counts"}
              </button>

              <button
                onClick={handleAddTestSnippets}
                disabled={isUpdating}
                className={`px-4 py-2 text-white rounded ${
                  isUpdating ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
                }`}>
                {isUpdating ? "Adding..." : "Add Test Snippets"}
              </button>
            </div>
            {updateMessage && (
              <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                {updateMessage}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-4">AI Generation</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settingsData.settings.aiGeneration.enabled}
                    onChange={handleAiEnabledChange}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded bg-black/30"
                    id="enable-ai-generation"
                    name="enable-ai-generation"
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
                    onChange={handleValidRatioChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full"
                    id="valid-ratio-slider"
                    name="valid-ratio-slider"
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
                      onChange={handleMaxPerRequestChange}
                      onClick={(e) => e.stopPropagation()}
                      min="1"
                      max="10"
                      className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full"
                      id="max-per-request"
                      name="max-per-request"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Min Snippets Before Generation
                    </label>
                    <input
                      type="number"
                      value={settingsData.settings.aiGeneration.minSnippetsBeforeGeneration}
                      onChange={handleMinSnippetsChange}
                      onClick={(e) => e.stopPropagation()}
                      min="1"
                      max="20"
                      className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full"
                      id="min-snippets-before-generation"
                      name="min-snippets-before-generation"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg mb-4">Language Volumes</h3>
              <div className="bg-black/30 p-4 rounded-lg mb-6">
                <h4 className="text-sm text-gray-400 mb-4">Add New Language</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Language Key</label>
                    <input
                      type="text"
                      value={newLanguage.key}
                      onChange={handleLanguageKeyChange}
                      ref={languageKeyRef}
                      className={`w-full bg-black/30 px-2 py-1 rounded-lg text-white ${focusClasses}`}
                      placeholder="e.g., javascript"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={newLanguage.displayName}
                      onChange={handleDisplayNameChange}
                      ref={displayNameRef}
                      className={`w-full bg-black/30 px-2 py-1 rounded-lg text-white ${focusClasses}`}
                      placeholder="e.g., JavaScript"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddLanguage}
                      disabled={!newLanguage.key || !newLanguage.displayName}
                      className="px-4 py-2 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Add Language
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  {availableIcons.map((iconData) => (
                    <div
                      key={iconData.name}
                      className={`p-2 rounded-lg cursor-pointer ${
                        newLanguage.icon === iconData.name
                          ? "bg-[#00FF94] text-black"
                          : "bg-black/30 text-gray-300"
                      }`}
                      onClick={() => setNewLanguage({ ...newLanguage, icon: iconData.name })}>
                      <div className="flex items-center space-x-2">
                        {newLanguage.icon === iconData.name
                          ? getColoredIcon(iconData.name, newLanguage.iconColor || "#FFFFFF")
                          : iconData.component}
                        <span className="text-xs">{iconData.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {settingsData.volumes.map((volume) => {
                  const languageName = capitalizeFirstLetter(volume.language);

                  return (
                    <div key={volume.language} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`${volume.status === "paused" ? "text-gray-500" : volume.status === "removed" ? "text-red-500" : "text-[#00FF94]"}`}>
                          {languageName}
                          {volume.status === "paused" && (
                            <span className="ml-2 text-sm">(Paused)</span>
                          )}
                          {volume.status === "removed" && (
                            <span className="ml-2 text-sm">(Removed)</span>
                          )}
                        </h4>
                        <div className="flex space-x-2">
                          {editingVolume === volume.language ? (
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

                              {volume.status !== "active" && (
                                <button
                                  onClick={() =>
                                    handleUpdateLanguageStatus(volume.language, "active")
                                  }
                                  className="flex items-center space-x-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors">
                                  <span>Activate</span>
                                </button>
                              )}

                              {volume.status !== "paused" && volume.status !== "removed" && (
                                <button
                                  onClick={() =>
                                    handleUpdateLanguageStatus(volume.language, "paused")
                                  }
                                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-700 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                                  <span>Pause</span>
                                </button>
                              )}

                              {volume.status !== "removed" && (
                                <button
                                  onClick={() =>
                                    handleUpdateLanguageStatus(volume.language, "removed")
                                  }
                                  className="flex items-center space-x-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors">
                                  <span>Remove</span>
                                </button>
                              )}

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

                      <div
                        className={`${editingVolume === volume.language ? "bg-black/40" : "bg-black/20"} p-4 rounded-lg`}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Icon</span>
                              {editingIcon === volume.language ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => setEditingIcon(null)}
                                    className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors">
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateLanguageIcon(
                                        volume.language,
                                        (volume as any)?.iconColor
                                      )
                                    }
                                    className="text-xs bg-[#00FF94] text-black px-2 py-1 rounded hover:bg-[#00CC77] transition-colors">
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingIcon(volume.language);
                                    setIconEditValue(volume.icon || "Code2");
                                  }}
                                  className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors">
                                  Edit
                                </button>
                              )}
                            </div>
                            {editingIcon === volume.language ? (
                              <div className="mt-2">
                                <select
                                  value={iconEditValue}
                                  onChange={handleIconEditChange}
                                  ref={iconEditSelectRef}
                                  className="w-full bg-black/30 px-2 py-1 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00FF94]"
                                  id="icon-edit-select"
                                  name="icon-edit-select">
                                  {availableIcons.map((iconData) => (
                                    <option key={iconData.name} value={iconData.name}>
                                      {iconData.name}
                                    </option>
                                  ))}
                                </select>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {availableIcons.map((iconData) => (
                                    <div
                                      key={iconData.name}
                                      className={`p-1 rounded cursor-pointer ${
                                        iconEditValue === iconData.name
                                          ? "bg-[#00FF94] text-black"
                                          : "bg-black/30 text-gray-300"
                                      }`}
                                      onClick={() => setIconEditValue(iconData.name)}>
                                      {iconEditValue === iconData.name && volume
                                        ? getColoredIcon(
                                            iconData.name,
                                            (volume as any).iconColor || "#FFFFFF"
                                          )
                                        : iconData.component}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 mt-1">
                                {volume.icon &&
                                  getColoredIcon(
                                    volume.icon,
                                    (volume as any).iconColor || "#FFFFFF"
                                  )}
                                <span className="text-sm">{volume.icon || "Code2"}</span>
                              </div>
                            )}
                          </div>
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
                            {editingVolume === volume.language ? (
                              <input
                                type="number"
                                min="1"
                                value={volumeEditValue}
                                onChange={handleVolumeEditChange}
                                ref={volumeEditRef}
                                className={`w-full bg-black/30 px-2 py-1 rounded-lg text-lg text-white ${focusClasses}`}
                                id="volume-edit-input"
                                name="volume-edit-input"
                              />
                            ) : (
                              <p className="text-xl">{volume.currentVolume}</p>
                            )}
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Status</span>
                            <p
                              className={`text-xl ${
                                volume.status === "active"
                                  ? "text-green-500"
                                  : volume.status === "paused"
                                    ? "text-yellow-500"
                                    : "text-red-500"
                              }`}>
                              {volume.status || "active"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Icon Color</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <input
                                type="color"
                                value={(volume as any)?.iconColor || "#FFFFFF"}
                                onChange={(e) =>
                                  handleIconColorChange(volume.language, e.target.value)
                                }
                                className="w-full h-8 rounded cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={() =>
                                  handleUpdateLanguageIconColor(
                                    volume.language,
                                    (volume as any)?.iconColor || "#FFFFFF"
                                  )
                                }
                                className="px-2 py-1 bg-[#00FF94] text-black rounded text-xs hover:bg-[#00CC77]">
                                Save Color
                              </button>
                            </div>
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
                            handleSettingsChangePreventDefault(e, difficulty as Difficulty, "time")
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full"
                          id={`time-limit-${difficulty}`}
                          name={`time-limit-${difficulty}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Snippets per Game
                        </label>
                        <input
                          type="number"
                          value={settingsData.settings.snippetsPerGame[difficulty as Difficulty]}
                          onChange={(e) =>
                            handleSettingsChangePreventDefault(
                              e,
                              difficulty as Difficulty,
                              "snippets"
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full"
                          id={`snippets-per-game-${difficulty}`}
                          name={`snippets-per-game-${difficulty}`}
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
    };

    const renderCodeSnippets = () => (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <select
            value={selectedLanguage}
            onChange={handleLanguageSelectChange}
            onClick={(e) => e.stopPropagation()}
            className={`${
              isDarkMode ? "bg-[#1A1A1A] text-white" : "bg-white text-black"
            } border border-gray-300 rounded-lg px-4 py-2 ${focusClasses}`}>
            {languages?.map((lang: LanguageVolume) => (
              <option key={lang.language} value={lang.language}>
                {capitalizeFirstLetter(lang.language)}
              </option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={handleDifficultySelectChange}
            onClick={(e) => e.stopPropagation()}
            className={`${
              isDarkMode ? "bg-[#1A1A1A] text-white" : "bg-white text-black"
            } border border-gray-300 rounded-lg px-4 py-2 ${focusClasses}`}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select
            value={selectedVolume}
            onChange={handleVolumeSelectChange}
            onClick={(e) => e.stopPropagation()}
            className={`${
              isDarkMode ? "bg-[#1A1A1A] text-white" : "bg-white text-black"
            } border border-gray-300 rounded-lg px-4 py-2 ${focusClasses}`}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((vol) => (
              <option key={vol} value={vol}>
                Volume {vol}
              </option>
            ))}
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
                    <span className="text-[#00FF94] font-mono">
                      {capitalizeFirstLetter(selectedLanguage)}
                    </span>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedSnippet(expandedSnippet === snippet._id ? null : snippet._id);
                    }}>
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
      if (!analyticsData) {
        return (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF94]"></div>
          </div>
        );
      }

      const { totalUsers, totalGames, difficultySummary, volumeSummary, levelSummary, languages } =
        analyticsData;

      // Convert difficulty summary object to array for rendering
      const difficultySummaryArray = difficultySummary
        ? Object.entries(difficultySummary).map(([difficulty, count]) => ({
            difficulty,
            count,
            averageScore: 0, // Since we don't have this data, default to 0
          }))
        : [];

      // Convert volume summary object to array for rendering
      const volumeSummaryArray = volumeSummary
        ? Object.entries(volumeSummary).map(([volume, count]) => ({
            volume: Number(volume),
            count,
            averageScore: 0, // Since we don't have this data, default to 0
          }))
        : [];

      // Convert level summary object to array for rendering
      const levelSummaryArray = levelSummary
        ? Object.entries(levelSummary).map(([level, count]) => ({
            level: Number(level),
            count,
            averageScore: 0, // Since we don't have this data, default to 0
          }))
        : [];

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
                <p className="text-3xl text-[#00FF94] font-bold">
                  {languages ? languages.length : 0}
                </p>
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
                  {difficultySummaryArray.map((item, index) => (
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
                    {volumeSummaryArray.map((item, index) => (
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
                    {levelSummaryArray.map((item, index) => (
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
                  {languages &&
                    languages.map((item, index) => (
                      <tr key={index} className="border-t border-gray-800">
                        <td className="p-4 capitalize">{item.language}</td>
                        <td className="p-4">{item.currentVolume}</td>
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
