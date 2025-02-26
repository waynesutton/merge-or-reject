/**
 * Games Module
 *
 * Handles game creation and retrieval operations.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export type Language = "javascript" | "typescript" | "python";

/**
 * Create a new game session
 */
export const createGame = mutation({
  args: {
    userId: v.id("users"),
    language: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    level: v.number(),
    volume: v.number(),
  },
  returns: v.id("games"),
  handler: async (ctx, args) => {
    const gameId = await ctx.db.insert("games", {
      userId: args.userId,
      language: args.language,
      difficulty: args.difficulty,
      level: args.level,
      volume: args.volume,
      score: 0,
      snippetsCompleted: 0,
      timestamp: new Date().toISOString(),
      snippetsPlayed: [],
      userAnswers: [],
      createdAt: new Date().toISOString(),
    });

    return gameId;
  },
});

/**
 * Get all games for a user
 */
export const getUserGames = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.array(
    v.object({
      _id: v.id("games"),
      language: v.string(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
      level: v.number(),
      volume: v.number(),
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
      .collect();
  },
});

/**
 * Save a completed game - public access
 */
export const saveGame = mutation({
  args: {
    userId: v.id("users"),
    language: v.string(),
    level: v.number(),
    volume: v.number(),
    snippetsPlayed: v.array(v.id("codeSnippets")),
    score: v.number(),
    userAnswers: v.array(v.boolean()),
  },
  returns: v.id("games"),
  handler: async (ctx, args) => {
    // Save the game
    const gameId = await ctx.db.insert("games", {
      userId: args.userId,
      language: args.language as Language,
      level: args.level,
      volume: args.volume,
      score: args.score,
      timestamp: new Date().toISOString(),
      snippetsPlayed: args.snippetsPlayed,
      userAnswers: args.userAnswers,
      difficulty: args.level === 1 ? "easy" : args.level === 2 ? "medium" : "hard",
      snippetsCompleted: args.snippetsPlayed.length,
      createdAt: new Date().toISOString(),
    });

    // Update user stats
    const user = await ctx.db.get(args.userId);
    if (user) {
      const totalGames = (user.totalGames || 0) + 1;
      const averageScore = user.averageScore
        ? (user.averageScore * (totalGames - 1) + args.score) / totalGames
        : args.score;

      await ctx.db.patch(args.userId, {
        totalGames,
        averageScore,
      });
    }

    return gameId;
  },
});

/**
 * Get recent games for a user - public access
 */
export const getRecentGames = query({
  args: {
    userId: v.id("users"),
    limit: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("games"),
      userId: v.id("users"),
      language: v.string(),
      level: v.number(),
      volume: v.number(),
      score: v.number(),
      timestamp: v.string(),
      snippetsPlayed: v.array(v.id("codeSnippets")),
      userAnswers: v.array(v.boolean()),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit);
  },
});

/**
 * Get top scores - public access
 */
export const getTopScores = query({
  args: {
    limit: v.number(),
    language: v.optional(v.string()),
    level: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      id: v.id("games"),
      playerName: v.string(),
      score: v.number(),
      language: v.string(),
      level: v.number(),
      volume: v.number(),
      timestamp: v.string(),
      snippetsPlayed: v.array(v.id("codeSnippets")),
    })
  ),
  handler: async (ctx, args) => {
    let query = ctx.db.query("games").order("desc");

    if (args.language) {
      query = query.filter((q) => q.eq(q.field("language"), args.language));
    }

    if (args.level) {
      query = query.filter((q) => q.eq(q.field("level"), args.level));
    }

    const games = await query.take(args.limit);

    // Fetch user details for each game
    const gamesWithUsers = await Promise.all(
      games.map(async (game) => {
        const user = await ctx.db.get(game.userId);
        return {
          id: game._id,
          playerName: user?.name || "Anonymous",
          score: game.score,
          language: game.language,
          level: game.level,
          volume: game.volume,
          timestamp: game.timestamp,
          snippetsPlayed: game.snippetsPlayed,
        };
      })
    );

    return gamesWithUsers;
  },
});
