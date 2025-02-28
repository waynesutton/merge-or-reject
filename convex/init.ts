import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { LANGUAGES } from "../src/types";

// Initialize game settings and default volumes if they don't exist
export const initializeSettings = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Initialize game settings if they don't exist
    const existingSettings = await ctx.db.query("gameSettings").first();
    if (!existingSettings) {
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
    }

    // Initialize default volumes for each language if they don't exist
    for (const language of Object.keys(LANGUAGES)) {
      const existingVolume = await ctx.db
        .query("languageVolumes")
        .withIndex("by_language", (q) => q.eq("language", language))
        .first();

      if (!existingVolume) {
        await ctx.db.insert("languageVolumes", {
          language,
          currentVolume: 1,
          snippetCount: 0,
          aiGeneratedCount: 0,
          lastAiGeneration: new Date().toISOString(),
        });
      }
    }

    return null;
  },
});
