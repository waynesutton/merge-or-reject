import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Language } from "../src/types";

// Initialize settings if they don't exist
export const initializeSettings = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    console.log("Starting settings initialization");

    const settings = await ctx.db.query("gameSettings").first();
    if (!settings) {
      console.log("No settings found, creating defaults");
      await ctx.db.insert("gameSettings", {
        timeLimits: {
          easy: 120,
          medium: 90,
          hard: 60,
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
      });
      console.log("Default settings created");
    } else {
      console.log("Settings already exist");
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
          medium: 90,
          hard: 60,
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

    if (!settings) {
      console.log("No settings found, using defaults");
      return defaultSettings;
    }

    // Get volumes
    const volumes = await ctx.db.query("languageVolumes").collect();
    console.log("Queried volumes:", volumes);

    // Map volumes to the expected format and remove system fields
    const mappedVolumes = volumes.map((vol) => ({
      language: vol.language,
      currentVolume: vol.currentVolume,
      snippetCount: vol.snippetCount,
      aiGeneratedCount: vol.aiGeneratedCount,
      lastAiGeneration: vol.lastAiGeneration,
    }));

    // Return formatted settings without system fields
    return {
      settings: {
        timeLimits: settings.timeLimits,
        snippetsPerGame: settings.snippetsPerGame,
        aiGeneration: settings.aiGeneration,
      },
      volumes: mappedVolumes,
    };
  },
});

// Update game settings - public access
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
    aiGeneration: v.optional(
      v.object({
        enabled: v.boolean(),
        validRatio: v.number(),
        maxPerRequest: v.number(),
        minSnippetsBeforeGeneration: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("gameSettings").first();

    if (settings) {
      const updates: any = {};
      if (args.timeLimits) updates.timeLimits = args.timeLimits;
      if (args.snippetsPerGame) updates.snippetsPerGame = args.snippetsPerGame;
      if (args.aiGeneration) updates.aiGeneration = args.aiGeneration;

      await ctx.db.patch(settings._id, updates);
    } else {
      await ctx.db.insert("gameSettings", {
        timeLimits: args.timeLimits || {
          easy: 120,
          medium: 90,
          hard: 60,
        },
        snippetsPerGame: args.snippetsPerGame || {
          easy: 3,
          medium: 5,
          hard: 7,
        },
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

// Create a new volume for a language - public access
export const createNewVolume = mutation({
  args: {
    language: v.string(),
  },
  handler: async (ctx, args) => {
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
      });
    } else {
      await ctx.db.insert("languageVolumes", {
        language: args.language as Language,
        currentVolume: 1,
        snippetCount: 0,
        aiGeneratedCount: 0,
        lastAiGeneration: new Date().toISOString(),
      });
    }
  },
});
