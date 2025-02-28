/**
 * Games Module
 *
 * Handles game creation and retrieval operations.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";

export type Language = "javascript" | "typescript" | "python";

// Define a type for the game document to help TypeScript
type GameDocument = {
  _id: Id<"games">;
  _creationTime: number;
  userId: Id<"users">;
  language: string;
  level: number;
  volume: number;
  score: number;
  difficulty: "easy" | "medium" | "hard";
  snippetsCompleted: number;
  timestamp: string;
  snippetsPlayed: Id<"codeSnippets">[];
  userAnswers: boolean[];
  createdAt: string;
  recap?: string;
  slugId?: string; // Added for friendly URLs
};

// Define a type for code snippets
type CodeSnippetDocument = {
  _id: Id<"codeSnippets">;
  _creationTime: number;
  code: string;
  language: string;
  isValid: boolean;
  explanation: string;
  difficulty: string;
  volume: number;
};

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
      _creationTime: v.number(),
      userId: v.id("users"),
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
      recap: v.optional(v.string()),
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
    // Save the game without recap first to get the ID
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

    // Generate a friendly slug using language, difficulty and a random number
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const difficulty = args.level === 1 ? "easy" : args.level === 2 ? "medium" : "hard";
    const slugId = `${args.language}-${difficulty}-${randomNum}-${gameId.slice(-6)}`;

    // Update the game with the recap URL that includes the friendly slug
    await ctx.db.patch(gameId, {
      recap: `recap/${slugId}`,
      slugId: slugId,
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
      recap: v.optional(v.string()),
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
 * Get game details for recap - public access
 */
export const getGameRecap = query({
  args: {
    gameId: v.string(),
  },
  returns: v.object({
    language: v.string(),
    level: v.number(),
    score: v.number(),
    snippets: v.array(
      v.object({
        code: v.string(),
        isValid: v.boolean(),
        userAnswer: v.boolean(),
        correct: v.boolean(),
        explanation: v.string(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    // Try to find the game by slugId first
    let game: GameDocument | null = null;

    // If the ID looks like a slug (contains hyphens), search by slugId
    if (args.gameId.includes("-")) {
      const gamesBySlug = await ctx.db
        .query("games")
        .withIndex("by_slug", (q) => q.eq("slugId", args.gameId))
        .collect();

      if (gamesBySlug.length > 0) {
        game = gamesBySlug[0] as GameDocument;
      }
    }

    // If not found by slug or not a slug format, try by ID
    if (!game) {
      try {
        // Check if the string is a valid Convex ID
        const gameId = args.gameId;
        const games = await ctx.db.query("games").collect();
        game = games.find((g) => g._id.toString() === gameId) as GameDocument | null;
      } catch (error) {
        // Invalid ID format, just proceed with null
      }
    }

    if (!game) {
      throw new Error("Game not found");
    }

    // Get all snippets for this game
    const snippetsData = [];
    for (let i = 0; i < game.snippetsPlayed.length; i++) {
      const snippetId = game.snippetsPlayed[i];
      // Make sure userAnswer has a default value even if it's not in the array
      const userAnswer = i < game.userAnswers.length ? game.userAnswers[i] : false;
      // Type the snippet as a CodeSnippetDocument
      const snippet = (await ctx.db.get(snippetId)) as CodeSnippetDocument | null;

      if (snippet) {
        snippetsData.push({
          code: snippet.code,
          isValid: snippet.isValid,
          userAnswer: userAnswer,
          correct: userAnswer === snippet.isValid,
          explanation: snippet.explanation,
        });
      }
    }

    return {
      language: game.language,
      level: game.level,
      score: game.score,
      snippets: snippetsData,
    };
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

/**
 * Get a single game by ID - public access
 */
export const getGameById = query({
  args: {
    gameId: v.id("games"),
  },
  returns: v.object({
    _id: v.id("games"),
    _creationTime: v.number(),
    language: v.string(),
    level: v.number(),
    volume: v.number(),
    score: v.number(),
    timestamp: v.string(),
    snippetsPlayed: v.array(v.id("codeSnippets")),
    userAnswers: v.array(v.boolean()),
    recap: v.optional(v.string()),
    slugId: v.optional(v.string()),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    snippetsCompleted: v.number(),
    createdAt: v.string(),
    userId: v.id("users"),
  }),
  handler: async (ctx, args) => {
    const game = (await ctx.db.get(args.gameId)) as GameDocument | null;
    if (!game) {
      throw new Error("Game not found");
    }
    return game;
  },
});
