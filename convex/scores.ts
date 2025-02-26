import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Language } from "../src/types";
import { Doc } from "./_generated/dataModel";
import { Id } from "./_generated/dataModel";

/**
 * Get top scores across all games
 */
export const getTopScores = query({
  args: {
    limit: v.number(),
    language: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      id: v.id("games"),
      playerName: v.string(),
      score: v.number(),
      language: v.string(),
      level: v.number(),
      timestamp: v.string(),
      totalSnippets: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let query = ctx.db.query("games").order("desc");

    if (args.language) {
      query = query.filter((q) => q.eq(q.field("language"), args.language));
    }

    const games = await query.take(args.limit);

    // Get user info for each game
    const scores = await Promise.all(
      games.map(async (game) => {
        const user = await ctx.db.get(game.userId);
        if (!user) return null;
        return {
          id: game._id,
          playerName: user.name,
          score: game.score,
          language: game.language,
          level: game.level,
          timestamp: game.timestamp,
          totalSnippets: game.snippetsPlayed.length,
        };
      })
    );

    return scores.filter((score): score is NonNullable<typeof score> => score !== null);
  },
});

/**
 * Get recent scores across all games
 */
export const getRecentScores = query({
  args: {
    limit: v.number(),
    language: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      id: v.id("games"),
      playerName: v.string(),
      score: v.number(),
      language: v.string(),
      level: v.number(),
      timestamp: v.string(),
      totalSnippets: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let query = ctx.db.query("games").order("desc");

    if (args.language) {
      query = query.filter((q) => q.eq(q.field("language"), args.language));
    }

    const games = await query.take(args.limit);

    // Get user info for each game
    const scores = await Promise.all(
      games.map(async (game) => {
        const user = await ctx.db.get(game.userId);
        if (!user) return null;
        return {
          id: game._id,
          playerName: user.name,
          score: game.score,
          language: game.language,
          level: game.level,
          timestamp: game.timestamp,
          totalSnippets: game.snippetsPlayed.length,
        };
      })
    );

    return scores.filter((score): score is NonNullable<typeof score> => score !== null);
  },
});

/**
 * Get user's personal best scores
 */
export const getUserTopScores = query({
  args: {
    userId: v.id("users"),
    limit: v.number(),
  },
  returns: v.array(
    v.object({
      id: v.id("games"),
      score: v.number(),
      language: v.string(),
      level: v.number(),
      timestamp: v.string(),
      totalSnippets: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const games = await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit);

    return games.map((game) => ({
      id: game._id,
      score: game.score,
      language: game.language,
      level: game.level,
      timestamp: game.timestamp,
      totalSnippets: game.snippetsPlayed.length,
    }));
  },
});

/**
 * Get user's game history
 */
export const getUserHistory = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.array(
    v.object({
      _id: v.id("games"),
      language: v.string(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
      level: v.number(),
      score: v.number(),
      snippetsCompleted: v.number(),
      timestamp: v.string(),
      snippetsPlayed: v.array(v.id("codeSnippets")),
      userAnswers: v.array(v.boolean()),
      createdAt: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
