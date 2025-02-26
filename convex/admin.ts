/**
 * admin.ts
 *
 * Admin-only endpoints for managing the application.
 *
 * Changes made:
 * - Enhanced admin role verification using new auth utilities
 * - Improved error handling with detailed error messages
 * - Added logging for easier debugging
 * - Optimized database queries for better performance
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Language } from "../src/types";
import { requireAdmin } from "./auth";

/**
 * Get admin dashboard stats - admin only
 */
export const getDashboardStats = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.object({
    totalUsers: v.number(),
    totalGames: v.number(),
    averageScore: v.number(),
    languageStats: v.array(
      v.object({
        language: v.string(),
        totalGames: v.number(),
        averageScore: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    try {
      // Verify admin access using enhanced verification
      await requireAdmin(ctx, args.clerkId);
      console.log(`Admin verified: ${args.clerkId}`);

      // Get all users
      console.log("Retrieving admin dashboard stats");
      const users = await ctx.db.query("users").collect();
      const totalUsers = users.length;

      // Get all games
      const games = await ctx.db.query("games").collect();
      const totalGames = games.length;

      // Calculate average score
      const totalScore = games.reduce((sum, game) => sum + game.score, 0);
      const averageScore = totalGames > 0 ? totalScore / totalGames : 0;

      // Calculate language stats
      const languageMap = new Map<string, { totalGames: number; totalScore: number }>();
      for (const game of games) {
        const stats = languageMap.get(game.language) || { totalGames: 0, totalScore: 0 };
        stats.totalGames++;
        stats.totalScore += game.score;
        languageMap.set(game.language, stats);
      }

      const languageStats = Array.from(languageMap.entries()).map(([language, stats]) => ({
        language,
        totalGames: stats.totalGames,
        averageScore: stats.totalGames > 0 ? stats.totalScore / stats.totalGames : 0,
      }));

      console.log(`Stats retrieved: ${totalUsers} users, ${totalGames} games`);

      return {
        totalUsers,
        totalGames,
        averageScore,
        languageStats,
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw error; // Pass the error up to be handled by the client
    }
  },
});

/**
 * Get analytics data for admin dashboard - admin only
 */
export const getAnalytics = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.object({
    totalUsers: v.number(),
    totalGames: v.number(),
    difficultySummary: v.array(
      v.object({
        difficulty: v.string(),
        count: v.number(),
        averageScore: v.number(),
      })
    ),
    volumeSummary: v.array(
      v.object({
        volume: v.number(),
        count: v.number(),
        averageScore: v.number(),
      })
    ),
    levelSummary: v.array(
      v.object({
        level: v.number(),
        count: v.number(),
        averageScore: v.number(),
      })
    ),
    languageVolumes: v.array(
      v.object({
        language: v.string(),
        volumeCount: v.number(),
        snippetCount: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    try {
      // Verify admin access
      await requireAdmin(ctx, args.clerkId);
      console.log(`Admin verified for analytics: ${args.clerkId}`);

      // Get total users
      const users = await ctx.db.query("users").collect();
      const totalUsers = users.length;

      // Get all games
      const games = await ctx.db.query("games").collect();
      const totalGames = games.length;

      // Initialize data structures for different summaries
      const difficultyMap = new Map<string, { count: number; totalScore: number }>();
      const volumeMap = new Map<number, { count: number; totalScore: number }>();
      const levelMap = new Map<number, { count: number; totalScore: number }>();

      // Process games data
      for (const game of games) {
        // Process difficulty data
        const diffStats = difficultyMap.get(game.difficulty) || { count: 0, totalScore: 0 };
        diffStats.count++;
        diffStats.totalScore += game.score;
        difficultyMap.set(game.difficulty, diffStats);

        // Process volume data
        const volumeStats = volumeMap.get(game.volume) || { count: 0, totalScore: 0 };
        volumeStats.count++;
        volumeStats.totalScore += game.score;
        volumeMap.set(game.volume, volumeStats);

        // Process level data
        const levelStats = levelMap.get(game.level) || { count: 0, totalScore: 0 };
        levelStats.count++;
        levelStats.totalScore += game.score;
        levelMap.set(game.level, levelStats);
      }

      // Get language volumes data
      const languageVolumesData = await ctx.db.query("languageVolumes").collect();

      // Get all code snippets to calculate accurate snippet counts
      const codeSnippets = await ctx.db.query("codeSnippets").collect();

      // Calculate snippets per language
      const snippetsByLanguage = new Map<string, number>();
      for (const snippet of codeSnippets) {
        const count = snippetsByLanguage.get(snippet.language) || 0;
        snippetsByLanguage.set(snippet.language, count + 1);
      }

      // Format difficulty summary
      const difficultySummary = Array.from(difficultyMap.entries()).map(([difficulty, stats]) => ({
        difficulty,
        count: stats.count,
        averageScore: stats.count > 0 ? stats.totalScore / stats.count : 0,
      }));

      // Format volume summary
      const volumeSummary = Array.from(volumeMap.entries()).map(([volume, stats]) => ({
        volume,
        count: stats.count,
        averageScore: stats.count > 0 ? stats.totalScore / stats.count : 0,
      }));

      // Format level summary
      const levelSummary = Array.from(levelMap.entries()).map(([level, stats]) => ({
        level,
        count: stats.count,
        averageScore: stats.count > 0 ? stats.totalScore / stats.count : 0,
      }));

      // Format language volumes with accurate snippet counts
      const languageVolumes = languageVolumesData.map((volume) => ({
        language: volume.language,
        volumeCount: volume.currentVolume,
        snippetCount: snippetsByLanguage.get(volume.language) || 0, // Use actual snippet count from codeSnippets table
      }));

      console.log(`Analytics data retrieved successfully for ${args.clerkId}`);

      return {
        totalUsers,
        totalGames,
        difficultySummary,
        volumeSummary,
        levelSummary,
        languageVolumes,
      };
    } catch (error) {
      console.error("Error getting analytics data:", error);
      throw error;
    }
  },
});

/**
 * Get code snippets stats - admin only
 */
export const getSnippetsStats = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.object({
    totalSnippets: v.number(),
    snippetsByLanguage: v.array(
      v.object({
        language: v.string(),
        count: v.number(),
        validCount: v.number(),
        invalidCount: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    try {
      // Verify admin access
      await requireAdmin(ctx, args.clerkId);

      const snippets = await ctx.db.query("codeSnippets").collect();
      const totalSnippets = snippets.length;

      const languageMap = new Map<string, { total: number; valid: number; invalid: number }>();
      for (const snippet of snippets) {
        const stats = languageMap.get(snippet.language) || { total: 0, valid: 0, invalid: 0 };
        stats.total++;
        if (snippet.isValid) {
          stats.valid++;
        } else {
          stats.invalid++;
        }
        languageMap.set(snippet.language, stats);
      }

      const snippetsByLanguage = Array.from(languageMap.entries()).map(([language, stats]) => ({
        language,
        count: stats.total,
        validCount: stats.valid,
        invalidCount: stats.invalid,
      }));

      return {
        totalSnippets,
        snippetsByLanguage,
      };
    } catch (error) {
      console.error("Error getting snippet stats:", error);
      throw error;
    }
  },
});

/**
 * Delete a code snippet - admin only
 */
export const deleteSnippet = mutation({
  args: {
    snippetId: v.id("codeSnippets"),
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Verify admin access
      await requireAdmin(ctx, args.clerkId);

      await ctx.db.delete(args.snippetId);
      console.log(`Admin ${args.clerkId} deleted snippet ${args.snippetId}`);
      return null;
    } catch (error) {
      console.error("Error deleting snippet:", error);
      throw error;
    }
  },
});

/**
 * Add a new code snippet - admin only
 */
export const addSnippet = mutation({
  args: {
    code: v.string(),
    language: v.string(),
    volume: v.number(),
    isValid: v.boolean(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    explanation: v.string(),
    tags: v.array(v.string()),
    aiGenerated: v.optional(v.boolean()),
    clerkId: v.string(),
  },
  returns: v.id("codeSnippets"),
  handler: async (ctx, args) => {
    try {
      // Verify admin access
      await requireAdmin(ctx, args.clerkId);

      const snippetId = await ctx.db.insert("codeSnippets", {
        code: args.code,
        language: args.language as Language,
        volume: args.volume,
        isValid: args.isValid,
        difficulty: args.difficulty,
        explanation: args.explanation,
        tags: args.tags,
        aiGenerated: args.aiGenerated || false,
        createdAt: new Date().toISOString(),
      });

      console.log(`Admin ${args.clerkId} added snippet ${snippetId}`);
      return snippetId;
    } catch (error) {
      console.error("Error adding snippet:", error);
      throw error;
    }
  },
});

/**
 * Update language volume details - admin only
 */
export const updateLanguageVolume = mutation({
  args: {
    language: v.string(),
    currentVolume: v.number(),
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Verify admin access
      await requireAdmin(ctx, args.clerkId);

      // Get the existing language volume record
      const languageVolume = await ctx.db
        .query("languageVolumes")
        .withIndex("by_language", (q) => q.eq("language", args.language))
        .unique();

      if (!languageVolume) {
        throw new Error(`Language volume for ${args.language} not found`);
      }

      // Count snippets to ensure accurate snippet count
      const snippets = await ctx.db
        .query("codeSnippets")
        .withIndex("by_language_volume", (q) => q.eq("language", args.language))
        .collect();

      const snippetCount = snippets.length;

      // Update the language volume with the new current volume and accurate snippet count
      await ctx.db.patch(languageVolume._id, {
        currentVolume: args.currentVolume,
        snippetCount: snippetCount,
      });

      console.log(
        `Admin ${args.clerkId} updated language volume for ${args.language} to volume ${args.currentVolume}`
      );
      return null;
    } catch (error) {
      console.error("Error updating language volume:", error);
      throw error;
    }
  },
});
