import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Language } from "./types";

// Query to get recent games
export const getRecentGames = query({
  args: { 
    limit: v.number() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .order("desc")
      .take(args.limit);
  },
});

// Query to get top scores
export const getTopScores = query({
  args: { 
    limit: v.number() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .order("desc")
      .take(args.limit);
  },
});