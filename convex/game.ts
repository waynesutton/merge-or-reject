/**
 * game.ts
 *
 * Game-related operations for starting games, submitting answers, and tracking results.
 *
 * Changes made:
 * - Added detailed validation for game creation
 * - Improved error handling for missing snippets
 * - Updated snippet selection to use by_language_difficulty index
 * - Added game recap and slug generation
 * - Fixed returns validator to avoid validation errors with document fields
 * - Added fallback strategy for fetching snippets when specific difficulty has too few (2024-07-10)
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Language } from "../src/types";

/**
 * Start a new game session - public access
 */
export const startGame = mutation({
  args: {
    userId: v.id("users"),
    language: v.string(),
    level: v.number(),
    volume: v.number(),
  },
  returns: v.object({
    gameId: v.id("games"),
    // Use v.any() to avoid validation errors with document fields
    snippets: v.array(v.any()),
    timeLimit: v.number(),
  }),
  handler: async (ctx, args) => {
    // Get game settings
    const settings = await ctx.db.query("gameSettings").first();
    if (!settings) throw new Error("Game settings not found");

    // Get snippets for the game
    const difficulty = args.level === 1 ? "easy" : args.level === 2 ? "medium" : "hard";
    const snippetsNeeded = settings.snippetsPerGame[difficulty];

    // Normalize language to lowercase for consistency
    const normalizedLanguage = args.language.toLowerCase().replace("c++", "cpp");

    console.log(
      `Fetching ${snippetsNeeded} ${difficulty} snippets for ${normalizedLanguage} (original: ${args.language})`
    );

    // Check language volume exists
    const languageVolume = await ctx.db
      .query("languageVolumes")
      .withIndex("by_language", (q) => q.eq("language", normalizedLanguage))
      .unique();

    if (!languageVolume) {
      console.error(`Language volume not found for ${normalizedLanguage}`);
      throw new Error(`Language ${normalizedLanguage} not configured`);
    }

    console.log(
      `Found language volume: ${languageVolume.language}, snippetCount: ${languageVolume.snippetCount}, status: ${languageVolume.status || "active"}`
    );

    // Count all snippets by difficulty first for diagnostic purposes
    const easySnippets = await ctx.db
      .query("codeSnippets")
      .withIndex("by_language_difficulty", (q) =>
        q.eq("language", normalizedLanguage).eq("difficulty", "easy")
      )
      .collect();

    const mediumSnippets = await ctx.db
      .query("codeSnippets")
      .withIndex("by_language_difficulty", (q) =>
        q.eq("language", normalizedLanguage).eq("difficulty", "medium")
      )
      .collect();

    const hardSnippets = await ctx.db
      .query("codeSnippets")
      .withIndex("by_language_difficulty", (q) =>
        q.eq("language", normalizedLanguage).eq("difficulty", "hard")
      )
      .collect();

    console.log(`Snippet counts for ${normalizedLanguage}: 
      Easy: ${easySnippets.length}
      Medium: ${mediumSnippets.length}
      Hard: ${hardSnippets.length}
    `);

    // Try to get the requested difficulty first
    let snippets = await ctx.db
      .query("codeSnippets")
      .withIndex("by_language_difficulty", (q) =>
        q.eq("language", normalizedLanguage).eq("difficulty", difficulty)
      )
      .take(snippetsNeeded);

    console.log(
      `Retrieved ${snippets.length} snippets for ${normalizedLanguage} with ${difficulty} difficulty`
    );

    // If we don't have enough snippets of the requested difficulty, try to fetch from other difficulties
    if (snippets.length < snippetsNeeded) {
      console.log(
        `Not enough ${difficulty} snippets. Attempting to use snippets from other difficulties.`
      );

      // Get all snippets for this language, regardless of difficulty
      const allSnippets = await ctx.db
        .query("codeSnippets")
        .withIndex("by_language_difficulty", (q) => q.eq("language", normalizedLanguage))
        .collect();

      console.log(`Found ${allSnippets.length} total snippets for ${normalizedLanguage}`);

      // If we have enough snippets in total, use them
      if (allSnippets.length >= snippetsNeeded) {
        // Shuffle the snippets array to get a random selection
        const shuffled = [...allSnippets].sort(() => 0.5 - Math.random());
        snippets = shuffled.slice(0, snippetsNeeded);
        console.log(`Using ${snippets.length} mixed-difficulty snippets instead`);
      } else {
        console.error(
          `Not enough snippets for ${normalizedLanguage} in any difficulty. Found: ${allSnippets.length}, needed: ${snippetsNeeded}`
        );
        throw new Error(
          `Not enough snippets available for ${normalizedLanguage} (need ${snippetsNeeded}, found ${allSnippets.length}). Please try another language or contact an administrator.`
        );
      }
    }

    // Create new game
    const gameId = await ctx.db.insert("games", {
      userId: args.userId,
      language: normalizedLanguage,
      level: args.level,
      volume: args.volume,
      score: 0,
      timestamp: new Date().toISOString(),
      snippetsPlayed: snippets.map((s) => s._id),
      userAnswers: [],
      difficulty: difficulty,
      snippetsCompleted: 0,
      createdAt: new Date().toISOString(),
    });

    // Get time limit from settings
    const timeLimit = settings.timeLimits[difficulty];

    return {
      gameId,
      snippets,
      timeLimit,
    };
  },
});

/**
 * Submit an answer for the current snippet - public access
 */
export const submitAnswer = mutation({
  args: {
    gameId: v.id("games"),
    isValid: v.boolean(),
  },
  returns: v.object({
    isCorrect: v.boolean(),
    explanation: v.string(),
    isGameOver: v.boolean(),
    score: v.number(),
  }),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    const currentSnippet = await ctx.db.get(game.snippetsPlayed[game.userAnswers.length]);
    if (!currentSnippet) throw new Error("Snippet not found");

    // Check if answer is correct
    const isCorrect = currentSnippet.isValid === args.isValid;
    const newScore = game.score + (isCorrect ? 1 : 0);

    // Update game with new answer
    await ctx.db.patch(args.gameId, {
      score: newScore,
      userAnswers: [...game.userAnswers, args.isValid],
    });

    const isGameOver = game.userAnswers.length + 1 === game.snippetsPlayed.length;
    if (isGameOver) {
      // Update user stats when game is over
      await updateUserStats(ctx, { gameId: args.gameId });
    }

    return {
      isCorrect,
      explanation: currentSnippet.explanation,
      isGameOver,
      score: newScore,
    };
  },
});

/**
 * Update user stats after game completion - public access
 */
export const updateUserStats = mutation({
  args: {
    gameId: v.id("games"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    // Update user stats
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_userId_language", (q) =>
        q.eq("userId", game.userId).eq("language", game.language)
      )
      .unique();

    if (stats) {
      const newGamesPlayed = stats.gamesPlayed + 1;
      const newAvgScore = (stats.averageScore * stats.gamesPlayed + game.score) / newGamesPlayed;

      await ctx.db.patch(stats._id, {
        gamesPlayed: newGamesPlayed,
        averageScore: newAvgScore,
        highestScore: Math.max(stats.highestScore, game.score),
        lastPlayed: game.timestamp,
        volumes: stats.volumes.includes(game.volume)
          ? stats.volumes
          : [...stats.volumes, game.volume],
      });
    } else {
      await ctx.db.insert("userStats", {
        userId: game.userId,
        language: game.language,
        gamesPlayed: 1,
        averageScore: game.score,
        highestScore: game.score,
        lastPlayed: game.timestamp,
        volumes: [game.volume],
      });
    }

    // Update user profile
    const user = await ctx.db.get(game.userId);
    if (user) {
      const newTotalGames = user.totalGames + 1;
      const newAvgScore = (user.averageScore * user.totalGames + game.score) / newTotalGames;

      await ctx.db.patch(game.userId, {
        totalGames: newTotalGames,
        averageScore: newAvgScore,
      });
    }

    return null;
  },
});

/**
 * Get current game state - public access
 */
export const getGameState = query({
  args: {
    gameId: v.id("games"),
  },
  returns: v.union(
    v.object({
      isGameOver: v.literal(true),
      score: v.number(),
    }),
    v.object({
      isGameOver: v.literal(false),
      currentSnippet: v.object({
        code: v.string(),
        language: v.string(),
      }),
      progress: v.object({
        current: v.number(),
        total: v.number(),
        score: v.number(),
      }),
    })
  ),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    const currentSnippetIndex = game.userAnswers.length;
    if (currentSnippetIndex >= game.snippetsPlayed.length) {
      return {
        isGameOver: true as const,
        score: game.score,
      };
    }

    const currentSnippet = await ctx.db.get(game.snippetsPlayed[currentSnippetIndex]);
    if (!currentSnippet) throw new Error("Snippet not found");

    return {
      isGameOver: false as const,
      currentSnippet: {
        code: currentSnippet.code,
        language: currentSnippet.language,
      },
      progress: {
        current: currentSnippetIndex + 1,
        total: game.snippetsPlayed.length,
        score: game.score,
      },
    };
  },
});

/**
 * Save final game score - public access
 */
export const saveGameScore = mutation({
  args: {
    gameId: v.id("games"),
    score: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    // Generate a friendly slug using language, difficulty and a random number
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const difficulty = game.level === 1 ? "easy" : game.level === 2 ? "medium" : "hard";
    const slugId = `${game.language}-${difficulty}-${randomNum}-${args.gameId.slice(-6)}`;

    // Update game with the final score and slugId
    await ctx.db.patch(args.gameId, {
      score: args.score,
      recap: `recap/${slugId}`,
      slugId: slugId,
    });

    return null;
  },
});

export const getLanguageName = query({
  args: {
    language: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Capitalize first letter and format language name
    return args.language.charAt(0).toUpperCase() + args.language.slice(1);
  },
});
