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
  returns: v.any(),
  handler: async (ctx, args) => {
    // Verify admin access
    requireAdmin(ctx, args.clerkId);

    try {
      console.log("Retrieving analytics data...");

      // Get all users
      const users = await ctx.db.query("users").collect();

      // Get all games
      const games = await ctx.db.query("games").collect();

      // Get all language volumes
      const languageVolumes = await ctx.db.query("languageVolumes").collect();
      console.log(`Found ${languageVolumes.length} language volumes`);

      // Count snippets for each language directly
      const languageData = await Promise.all(
        languageVolumes.map(async (volume) => {
          const normalizedLanguage = volume.language.toLowerCase();
          console.log(`Counting snippets for language: ${normalizedLanguage}`);

          // Count snippets using by_language_difficulty index
          const snippets = await ctx.db
            .query("codeSnippets")
            .withIndex("by_language_difficulty", (q) => q.eq("language", normalizedLanguage))
            .collect();

          // Count snippets by difficulty for diagnostic purposes
          const easyCount = snippets.filter((s) => s.difficulty === "easy").length;
          const mediumCount = snippets.filter((s) => s.difficulty === "medium").length;
          const hardCount = snippets.filter((s) => s.difficulty === "hard").length;

          console.log(
            `Found ${snippets.length} snippets for ${normalizedLanguage} (easy: ${easyCount}, medium: ${mediumCount}, hard: ${hardCount})`
          );

          // Note: We can't update the database in a query function, so we'll just return the accurate count
          // If the count is wrong, it will be fixed when updateSnippetCounts is called
          if (volume.snippetCount !== snippets.length) {
            console.log(
              `Snippet count mismatch for ${normalizedLanguage}: DB has ${volume.snippetCount}, actual count is ${snippets.length}`
            );
          }

          // Return processed data
          return {
            ...volume,
            language: normalizedLanguage, // Use normalized language name
            snippetCount: snippets.length, // Ensure we're using the actual count from the query
            difficultyCounts: {
              easy: easyCount,
              medium: mediumCount,
              hard: hardCount,
            },
          };
        })
      );

      // Get difficulty, volume, and level summaries from games
      const difficultySummary = {
        easy: games.filter((g) => g.difficulty === "easy").length,
        medium: games.filter((g) => g.difficulty === "medium").length,
        hard: games.filter((g) => g.difficulty === "hard").length,
      };

      const volumeSummary = games.reduce(
        (acc, game) => {
          acc[game.volume] = (acc[game.volume] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );

      const levelSummary = games.reduce(
        (acc, game) => {
          acc[game.level] = (acc[game.level] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );

      // Return all analytics data
      return {
        totalUsers: users.length,
        totalGames: games.length,
        languages: languageData,
        difficultySummary,
        volumeSummary,
        levelSummary,
      };
    } catch (error) {
      console.error("Error retrieving analytics:", error);
      throw new Error("Failed to retrieve analytics data");
    }
  },
});

/**
 * Get snippet statistics - admin only
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
    // Verify admin access
    await requireAdmin(ctx, args.clerkId);

    try {
      console.log("Retrieving snippet statistics...");

      // Get all language volumes to determine which languages to count
      const languageVolumes = await ctx.db.query("languageVolumes").collect();
      console.log(`Found ${languageVolumes.length} language volumes`);

      // Count snippets for each language directly
      const snippetsByLanguage = await Promise.all(
        languageVolumes.map(async (volume) => {
          const normalizedLanguage = volume.language.toLowerCase();
          console.log(`Counting snippets for language: ${normalizedLanguage}`);

          // Count snippets using by_language_difficulty index
          const snippets = await ctx.db
            .query("codeSnippets")
            .withIndex("by_language_difficulty", (q) => q.eq("language", normalizedLanguage))
            .collect();

          // Count valid and invalid snippets
          const validCount = snippets.filter((s) => s.isValid).length;
          const invalidCount = snippets.filter((s) => !s.isValid).length;

          console.log(
            `Found ${snippets.length} snippets for ${normalizedLanguage} (valid: ${validCount}, invalid: ${invalidCount})`
          );

          return {
            language: normalizedLanguage,
            count: snippets.length,
            validCount,
            invalidCount,
          };
        })
      );

      // Calculate total snippet count
      const totalSnippets = snippetsByLanguage.reduce((sum, lang) => sum + lang.count, 0);

      return {
        totalSnippets,
        snippetsByLanguage,
      };
    } catch (error) {
      console.error("Error getting snippet statistics:", error);
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

      // Get the snippet to know its language
      const snippet = await ctx.db.get(args.snippetId);
      if (!snippet) {
        throw new Error("Snippet not found");
      }

      // Delete the snippet
      await ctx.db.delete(args.snippetId);

      // Update language volume snippet count
      const languageVolume = await ctx.db
        .query("languageVolumes")
        .withIndex("by_language", (q) => q.eq("language", snippet.language))
        .unique();

      if (languageVolume) {
        await ctx.db.patch(languageVolume._id, {
          snippetCount: Math.max(0, languageVolume.snippetCount - 1),
        });
      }

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

      // Update language volume snippet count
      const languageVolume = await ctx.db
        .query("languageVolumes")
        .withIndex("by_language", (q) => q.eq("language", args.language))
        .unique();

      if (languageVolume) {
        await ctx.db.patch(languageVolume._id, {
          snippetCount: languageVolume.snippetCount + 1,
        });
      }

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

      // Count all snippets for this language regardless of volume
      const snippets = await ctx.db
        .query("codeSnippets")
        .withIndex("by_language_difficulty", (q) => q.eq("language", args.language))
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

/**
 * Add a new language volume - admin only
 */
export const addLanguageVolume = mutation({
  args: {
    language: v.string(),
    displayName: v.string(),
    icon: v.optional(v.string()),
    iconColor: v.optional(v.string()),
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Verify admin access
      await requireAdmin(ctx, args.clerkId);

      // Check if the language already exists
      const existingLanguage = await ctx.db
        .query("languageVolumes")
        .withIndex("by_language", (q) => q.eq("language", args.language))
        .unique();

      if (existingLanguage) {
        throw new Error(`Language volume for ${args.language} already exists`);
      }

      // Create insert data object
      const insertData = {
        language: args.language,
        currentVolume: 1,
        snippetCount: 0,
        aiGeneratedCount: 0,
        lastAiGeneration: new Date().toISOString(),
        status: "active" as "active" | "paused" | "removed",
        icon: args.icon,
        displayName: args.displayName,
      };

      // Add iconColor if provided
      if (args.iconColor) {
        (insertData as any).iconColor = args.iconColor;
      }

      // Create a new language volume
      await ctx.db.insert("languageVolumes", insertData);

      console.log(`Admin ${args.clerkId} added new language volume for ${args.language}`);
      return null;
    } catch (error) {
      console.error("Error adding language volume:", error);
      throw error;
    }
  },
});

/**
 * Update a language volume's status - admin only
 */
export const updateLanguageStatus = mutation({
  args: {
    language: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("removed")),
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

      // Update the language volume status
      await ctx.db.patch(languageVolume._id, {
        status: args.status,
      });

      console.log(
        `Admin ${args.clerkId} updated language ${args.language} status to ${args.status}`
      );
      return null;
    } catch (error) {
      console.error("Error updating language status:", error);
      throw error;
    }
  },
});

/**
 * Update a language volume's icon - admin only
 */
export const updateLanguageIcon = mutation({
  args: {
    language: v.string(),
    icon: v.string(),
    iconColor: v.optional(v.string()),
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

      // Create update object with icon
      const updateObj: Record<string, any> = {
        icon: args.icon,
      };

      // Add iconColor to update if provided
      if (args.iconColor) {
        updateObj.iconColor = args.iconColor;
      }

      // Update the language volume icon and color if provided
      await ctx.db.patch(languageVolume._id, updateObj);

      console.log(
        `Admin ${args.clerkId} updated language ${args.language} icon to ${args.icon}${args.iconColor ? ` with color ${args.iconColor}` : ""}`
      );
      return null;
    } catch (error) {
      console.error("Error updating language icon:", error);
      throw error;
    }
  },
});

export const getLanguages = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("languageVolumes"),
      _creationTime: v.number(),
      language: v.string(),
      currentVolume: v.float64(),
      snippetCount: v.float64(),
      aiGeneratedCount: v.float64(),
      lastAiGeneration: v.string(),
      status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("removed"))),
      icon: v.optional(v.string()),
      iconColor: v.optional(v.string()),
      displayName: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("languageVolumes").collect();
  },
});

/**
 * Update snippet counts for all languages - admin only
 */
export const updateSnippetCounts = mutation({
  args: {
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Verify admin access
      await requireAdmin(ctx, args.clerkId);

      console.log("Beginning snippet count update for all languages");

      // Get all language volumes
      const languageVolumes = await ctx.db.query("languageVolumes").collect();
      console.log(`Found ${languageVolumes.length} language volumes to update`);

      // Update each language volume with the correct count
      for (const volume of languageVolumes) {
        // Ensure language is normalized to lowercase for consistency
        const normalizedLanguage = volume.language.toLowerCase();
        console.log(`Updating count for language: ${normalizedLanguage}`);

        // Count all snippets for this language using by_language_difficulty index
        const snippets = await ctx.db
          .query("codeSnippets")
          .withIndex("by_language_difficulty", (q) => q.eq("language", normalizedLanguage))
          .collect();

        // Count snippets by difficulty for diagnostic purposes
        const easyCount = snippets.filter((s) => s.difficulty === "easy").length;
        const mediumCount = snippets.filter((s) => s.difficulty === "medium").length;
        const hardCount = snippets.filter((s) => s.difficulty === "hard").length;

        console.log(
          `Found ${snippets.length} snippets for ${normalizedLanguage} (easy: ${easyCount}, medium: ${mediumCount}, hard: ${hardCount})`
        );

        // Update the language volume with the correct count
        await ctx.db.patch(volume._id, {
          snippetCount: snippets.length,
          language: normalizedLanguage, // Ensure language is stored in lowercase
        });

        console.log(`Updated ${normalizedLanguage} snippet count to ${snippets.length}`);
      }

      console.log("Finished updating all language snippet counts");
      return null;
    } catch (error) {
      console.error("Error updating snippet counts:", error);
      throw error;
    }
  },
});
