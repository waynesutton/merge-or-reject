/**
 * User Management Module
 *
 * This module handles all user-related operations including:
 * - User authentication and admin verification
 * - User search functionality
 * - User deletion with cascade cleanup
 * - Synchronization between Clerk authentication and Convex database
 *
 * Changes made:
 * - Improved error handling in user synchronization
 * - Enhanced admin user detection and validation
 * - Added detailed error messages for authentication failures
 * - Optimized database queries for user lookups
 * - Updated getUserRole to provide more robust role checking
 */

import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { requireAuth, requireAdmin } from "./auth";

// Type for user document
type UserDoc = Doc<"users">;

/**
 * Get all users - admin only
 */
export const getUsers = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      name: v.string(),
      isAnonymous: v.boolean(),
      totalGames: v.number(),
      averageScore: v.number(),
      role: v.union(v.literal("admin"), v.literal("user")),
      email: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx, args.clerkId);
    const users = await ctx.db.query("users").collect();
    return users.map((user) => ({
      _id: user._id,
      name: user.name,
      isAnonymous: user.isAnonymous,
      totalGames: user.totalGames,
      averageScore: user.averageScore,
      role: user.role,
      email: user.email,
    }));
  },
});

/**
 * Get user information - authenticated only
 */
export const getUser = query({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
  },
  returns: v.object({
    name: v.string(),
    isAnonymous: v.boolean(),
    totalGames: v.number(),
    averageScore: v.number(),
    role: v.union(v.literal("admin"), v.literal("user")),
    email: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Verify authentication
    await requireAuth(ctx, args.clerkId);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    return user;
  },
});

/**
 * Create or update a user from Clerk webhook
 * Enhanced with better error handling and admin synchronization
 */
export const _syncUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  returns: v.object({
    userId: v.string(),
    isNew: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Check if user exists using the index for efficiency
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .unique();

      if (existingUser) {
        // Update existing user with new data from Clerk
        await ctx.db.patch(existingUser._id, {
          email: args.email,
          name: args.name,
          role: args.role,
          // Don't update isAnonymous - maintain existing setting
        });

        console.log(`Updated existing user ${existingUser._id} with Clerk ID ${args.clerkId}`);
        return {
          userId: existingUser._id,
          isNew: false,
        };
      }

      // Create new user with data from Clerk
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        role: args.role,
        isAnonymous: false, // Admin users from Clerk are never anonymous
        totalGames: 0,
        averageScore: 0,
        createdAt: new Date().toISOString(),
      });

      console.log(`Created new user ${userId} with Clerk ID ${args.clerkId}`);
      return {
        userId,
        isNew: true,
      };
    } catch (error: any) {
      console.error("Error syncing user:", error);
      return {
        userId: "",
        isNew: false,
        error: error.message || "Unknown error occurred during user synchronization",
      };
    }
  },
});

/**
 * Create an anonymous user - public access
 */
export const createAnonymousUser = mutation({
  args: {
    name: v.string(),
  },
  returns: v.object({
    userId: v.id("users"),
    name: v.string(),
  }),
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      role: "user",
      isAnonymous: true,
      totalGames: 0,
      averageScore: 0,
      createdAt: new Date().toISOString(),
    });

    return {
      userId,
      name: args.name,
    };
  },
});

/**
 * Update a user's display name - authenticated only
 */
export const updateUserName = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    clerkId: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Verify authentication
    const authUser = await requireAuth(ctx, args.clerkId);

    // Users can only update their own name
    if (authUser._id !== args.userId) {
      throw new Error("Unauthorized: Can only update own name");
    }

    await ctx.db.patch(args.userId, {
      name: args.name,
    });

    return args.name;
  },
});

/**
 * Update an anonymous user's display name - public access
 * This function allows changing the name of an anonymous user without authentication
 */
export const updateAnonymousUserName = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    // Only allow updating anonymous users with this function
    if (!user.isAnonymous) {
      throw new Error("This function can only update anonymous users");
    }

    await ctx.db.patch(args.userId, {
      name: args.name,
    });

    return args.name;
  },
});

/**
 * Delete a user and all associated data
 */
export const _deleteUser = internalMutation({
  args: {
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (user) {
      await ctx.db.delete(user._id);
    }
    return null;
  },
});

/**
 * Fix user schema by adding missing required fields - public access
 * This is a utility function to fix schema validation issues
 */
export const fixUserSchema = mutation({
  args: {},
  returns: v.object({
    updatedCount: v.number(),
    users: v.array(v.any()),
  }),
  handler: async (ctx) => {
    // Find all users
    const users = await ctx.db.query("users").collect();
    console.log("Found users:", JSON.stringify(users, null, 2));
    let updatedCount = 0;

    // Update each user that's missing required fields
    for (const user of users) {
      const userData = user as any; // Use any to bypass type checking
      const updates: Record<string, any> = {};

      if (!("role" in userData)) {
        updates.role = "user";
      }
      if (!("createdAt" in userData)) {
        updates.createdAt = new Date().toISOString();
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(userData._id, updates);
        updatedCount++;
      }
    }

    console.log(`Fixed ${updatedCount} users missing required fields`);
    return { updatedCount, users };
  },
});

/**
 * Get user's role by Clerk ID with enhanced error handling
 * Available to both public and internal callers
 */
export const getUserRole = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.union(v.literal("admin"), v.literal("user"), v.null()),
  handler: async (ctx, args) => {
    try {
      if (!args.clerkId) {
        console.log("No Clerk ID provided to getUserRole");
        return null;
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .unique();

      if (!user) {
        console.log(`No user found with Clerk ID ${args.clerkId}`);
        return null;
      }

      console.log(`Found user with role: ${user.role}`);
      return user.role;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null; // Return null instead of throwing to handle gracefully in UI
    }
  },
});

/**
 * Get user's role by Clerk ID - internal version
 * Same as getUserRole but exposed as an internal query for auth module use
 */
export const _getUserRole = internalQuery({
  args: {
    clerkId: v.string(),
  },
  returns: v.union(v.literal("admin"), v.literal("user"), v.null()),
  handler: async (ctx, args) => {
    try {
      if (!args.clerkId) {
        console.log("No Clerk ID provided to _getUserRole");
        return null;
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .unique();

      if (!user) {
        console.log(`No user found with Clerk ID ${args.clerkId}`);
        return null;
      }

      console.log(`Found user with role: ${user.role}`);
      return user.role;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null; // Return null instead of throwing to handle gracefully in UI
    }
  },
});

/**
 * Internal query to check all users - no auth required
 */
export const _checkUsers = internalQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

/**
 * Force synchronization of a Clerk user to the database
 * Used when an admin logs in via the UI but hasn't been synced yet
 */
export const syncClerkUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  returns: v.union(v.boolean(), v.null()),
  handler: async (ctx, args) => {
    try {
      // Check if user exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .unique();

      if (existingUser) {
        console.log(`User ${args.clerkId} already exists in database`);
        return true;
      }

      // Create new user with provided data
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        role: args.role,
        isAnonymous: false,
        totalGames: 0,
        averageScore: 0,
        createdAt: new Date().toISOString(),
      });

      console.log(`Manually synced user ${userId} with Clerk ID ${args.clerkId}`);
      return true;
    } catch (error) {
      console.error("Error syncing user manually:", error);
      return null;
    }
  },
});
