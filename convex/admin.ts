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
