import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { LANGUAGES } from "../src/types";

export const getLanguageVolumes = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const volumes = await ctx.db.query("languageVolumes").collect();
    console.log("All language volumes:", volumes);
    return volumes;
  },
});

export const addMissingLanguageVolumes = mutation({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const existingVolumes = await ctx.db.query("languageVolumes").collect();
    const existingLanguages = new Set(existingVolumes.map((volume) => volume.language));

    const missingLanguages = Object.keys(LANGUAGES).filter(
      (language) => !existingLanguages.has(language)
    );

    const addedLanguages = [];

    for (const language of missingLanguages) {
      await ctx.db.insert("languageVolumes", {
        language,
        currentVolume: 1,
        snippetCount: 0,
        aiGeneratedCount: 0,
        lastAiGeneration: new Date().toISOString(),
      });
      addedLanguages.push(language);
    }

    console.log("Added missing language volumes for:", addedLanguages);
    return addedLanguages;
  },
});
