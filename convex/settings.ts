import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Language } from "../src/types";
import { requireAdmin } from "./auth";

// Migrate existing settings to include new required fields
export const migrateSettings = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Get all existing settings
    const settings = await ctx.db.query("gameSettings").collect();

    // Update each document that's missing the required fields
    for (const setting of settings) {
      if (!setting.minSnippetsPerVolume || !setting.maxSnippetsPerVolume) {
        await ctx.db.patch(setting._id, {
          minSnippetsPerVolume: 10,
          maxSnippetsPerVolume: 50,
        });
      }
    }
    return null;
  },
});

// Initialize settings if they don't exist
export const initializeSettings = mutation({
  args: {
    reset: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log("Starting settings initialization");

    // If reset is true, delete all existing settings
    if (args.reset) {
      console.log("Resetting settings");
      const settings = await ctx.db.query("gameSettings").collect();
      for (const setting of settings) {
        await ctx.db.delete(setting._id);
      }
    }

    const settings = await ctx.db.query("gameSettings").first();
    if (!settings) {
      console.log("No settings found, creating defaults");
      await ctx.db.insert("gameSettings", {
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
        minSnippetsPerVolume: 10,
        maxSnippetsPerVolume: 50,
        aiGeneration: {
          enabled: true,
          validRatio: 0.5,
          maxPerRequest: 5,
          minSnippetsBeforeGeneration: 5,
        },
      });
      console.log("Default settings created");
    } else {
      console.log("Settings exist, ensuring required fields");
      // Always update the required fields
      await ctx.db.patch(settings._id, {
        minSnippetsPerVolume: settings.minSnippetsPerVolume ?? 10,
        maxSnippetsPerVolume: settings.maxSnippetsPerVolume ?? 50,
      });
      console.log("Settings updated with required fields");
    }
    return null;
  },
});

// Get game settings - public access, no auth required
export const getSettings = query({
  args: {},
  returns: v.object({
    settings: v.object({
      timeLimits: v.object({
        easy: v.number(),
        medium: v.number(),
        hard: v.number(),
      }),
      snippetsPerGame: v.object({
        easy: v.number(),
        medium: v.number(),
        hard: v.number(),
      }),
      minSnippetsPerVolume: v.number(),
      maxSnippetsPerVolume: v.number(),
      aiGeneration: v.object({
        enabled: v.boolean(),
        validRatio: v.number(),
        maxPerRequest: v.number(),
        minSnippetsBeforeGeneration: v.number(),
      }),
    }),
    volumes: v.array(
      v.object({
        language: v.string(),
        currentVolume: v.number(),
        snippetCount: v.number(),
        aiGeneratedCount: v.number(),
        lastAiGeneration: v.string(),
        status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("removed"))),
        icon: v.optional(v.string()),
      })
    ),
  }),
  handler: async (ctx) => {
    console.log("Starting getSettings query");

    // Get settings or use defaults
    const settings = await ctx.db.query("gameSettings").first();
    console.log("Queried settings:", settings);

    const defaultSettings = {
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
        minSnippetsPerVolume: 10,
        maxSnippetsPerVolume: 50,
        aiGeneration: {
          enabled: true,
          validRatio: 0.5,
          maxPerRequest: 5,
          minSnippetsBeforeGeneration: 5,
        },
      },
      volumes: [],
    };

    if (!settings) {
      console.log("No settings found, using defaults");
      return defaultSettings;
    }

    // Get volumes
    const volumes = await ctx.db.query("languageVolumes").collect();
    console.log(`Found ${volumes.length} language volumes`);

    // For each language, count snippets directly using the by_language_difficulty index
    const volumesWithCounts = await Promise.all(
      volumes.map(async (vol) => {
        // Ensure language is normalized to lowercase for consistency
        const normalizedLanguage = vol.language.toLowerCase();
        
        // Count all snippets for this language regardless of volume
        const snippets = await ctx.db
          .query("codeSnippets")
          .withIndex("by_language_difficulty", (q) => q.eq("language", normalizedLanguage))
          .collect();

        // Count snippets by difficulty for diagnostic purposes
        const easySnippets = snippets.filter(s => s.difficulty === "easy").length;
        const mediumSnippets = snippets.filter(s => s.difficulty === "medium").length;
        const hardSnippets = snippets.filter(s => s.difficulty === "hard").length;

        console.log(`Found ${snippets.length} snippets for ${normalizedLanguage} (easy: ${easySnippets}, medium: ${mediumSnippets}, hard: ${hardSnippets})`);

        // Note: We can't update the database in a query function, so we'll just return the accurate count
        // If the count is wrong, it will be fixed when updateSnippetCounts is called
        if (vol.snippetCount !== snippets.length) {
          console.log(`Snippet count mismatch for ${normalizedLanguage}: DB has ${vol.snippetCount}, actual count is ${snippets.length}`);
        }

        return {
          language: normalizedLanguage, // Use normalized language name
          currentVolume: vol.currentVolume,
          snippetCount: snippets.length, // Use direct count from codeSnippets
          aiGeneratedCount: vol.aiGeneratedCount,
          lastAiGeneration: vol.lastAiGeneration,
          status: vol.status || "active", // Default to active for existing records
          icon: vol.icon, // Include the icon in the response
        };
      })
    );

    // Return formatted settings without system fields
    return {
      settings: {
        timeLimits: settings.timeLimits,
        snippetsPerGame: settings.snippetsPerGame,
        minSnippetsPerVolume: settings.minSnippetsPerVolume ?? 10,
        maxSnippetsPerVolume: settings.maxSnippetsPerVolume ?? 50,
        aiGeneration: settings.aiGeneration,
      },
      volumes: volumesWithCounts,
    };
  },
});

// Update game settings - admin only
export const updateSettings = mutation({
  args: {
    timeLimits: v.optional(
      v.object({
        easy: v.number(),
        medium: v.number(),
        hard: v.number(),
      })
    ),
    snippetsPerGame: v.optional(
      v.object({
        easy: v.number(),
        medium: v.number(),
        hard: v.number(),
      })
    ),
    minSnippetsPerVolume: v.optional(v.number()),
    maxSnippetsPerVolume: v.optional(v.number()),
    aiGeneration: v.optional(
      v.object({
        enabled: v.boolean(),
        validRatio: v.number(),
        maxPerRequest: v.number(),
        minSnippetsBeforeGeneration: v.number(),
      })
    ),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx, args.clerkId);

    const settings = await ctx.db.query("gameSettings").first();

    if (settings) {
      const updates: any = {};
      if (args.timeLimits) updates.timeLimits = args.timeLimits;
      if (args.snippetsPerGame) updates.snippetsPerGame = args.snippetsPerGame;
      if (args.minSnippetsPerVolume !== undefined)
        updates.minSnippetsPerVolume = args.minSnippetsPerVolume;
      if (args.maxSnippetsPerVolume !== undefined)
        updates.maxSnippetsPerVolume = args.maxSnippetsPerVolume;
      if (args.aiGeneration) updates.aiGeneration = args.aiGeneration;

      await ctx.db.patch(settings._id, updates);
    } else {
      await ctx.db.insert("gameSettings", {
        timeLimits: args.timeLimits || {
          easy: 120,
          medium: 100,
          hard: 30,
        },
        snippetsPerGame: args.snippetsPerGame || {
          easy: 3,
          medium: 5,
          hard: 7,
        },
        minSnippetsPerVolume: args.minSnippetsPerVolume || 10,
        maxSnippetsPerVolume: args.maxSnippetsPerVolume || 50,
        aiGeneration: args.aiGeneration || {
          enabled: true,
          validRatio: 0.5,
          maxPerRequest: 5,
          minSnippetsBeforeGeneration: 5,
        },
      });
    }
  },
});

// Create a new volume for a language - admin only
export const createNewVolume = mutation({
  args: {
    language: v.string(),
    clerkId: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx, args.clerkId);

    const volume = await ctx.db
      .query("languageVolumes")
      .withIndex("by_language", (q) => q.eq("language", args.language as Language))
      .first();

    if (volume) {
      await ctx.db.patch(volume._id, {
        currentVolume: volume.currentVolume + 1,
        snippetCount: 0,
        aiGeneratedCount: 0,
        lastAiGeneration: new Date().toISOString(),
        // Don't update the icon if it already exists
      });
    } else {
      await ctx.db.insert("languageVolumes", {
        language: args.language as Language,
        currentVolume: 1,
        snippetCount: 0,
        aiGeneratedCount: 0,
        lastAiGeneration: new Date().toISOString(),
        status: "active",
        icon: args.icon,
      });
    }
  },
});

// Reset settings to defaults
export const resetSettings = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    console.log("Starting settings reset");

    // Delete all existing settings
    const settings = await ctx.db.query("gameSettings").collect();
    for (const setting of settings) {
      await ctx.db.delete(setting._id);
    }

    // Create new settings with all required fields
    await ctx.db.insert("gameSettings", {
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
      minSnippetsPerVolume: 10,
      maxSnippetsPerVolume: 50,
      aiGeneration: {
        enabled: true,
        validRatio: 0.5,
        maxPerRequest: 5,
        minSnippetsBeforeGeneration: 5,
      },
    });

    console.log("Settings reset complete");
    return null;
  },
});
