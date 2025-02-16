import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Language } from "./types";
import { requireAdmin } from "./users";

// Get game settings
export const getSettings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Verify admin access
    await requireAdmin(ctx, identity.subject);

    return await ctx.db.query("languageVolumes").collect();
  },
});

// Update game settings
export const updateSettings = mutation({
  args: {
    language: v.string(),
    timeLimit: v.object({
      easy: v.number(),
      medium: v.number(),
      hard: v.number(),
    }),
    snippetsPerGame: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Verify admin access
    await requireAdmin(ctx, identity.subject);

    const settings = await ctx.db
      .query("languageVolumes")
      .withIndex("by_language", (q) => q.eq("language", args.language as Language))
      .first();

    if (settings) {
      await ctx.db.patch(settings._id, {
        timeLimit: args.timeLimit,
        snippetsPerGame: args.snippetsPerGame,
      });
    } else {
      await ctx.db.insert("languageVolumes", {
        language: args.language as Language,
        currentVolume: 1,
        snippetCount: 0,
        timeLimit: args.timeLimit,
        snippetsPerGame: args.snippetsPerGame,
      });
    }
  },
});