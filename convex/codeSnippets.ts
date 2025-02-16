import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Language } from "./types";

// Query to get code snippets for a game
export const getCodeSnippets = query({
  args: { 
    language: v.string(),
    volume: v.number(),
    limit: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("codeSnippets")
      .withIndex("by_language_volume", (q) => 
        q.eq("language", args.language as Language).eq("volume", args.volume)
      )
      .take(args.limit);
  },
});