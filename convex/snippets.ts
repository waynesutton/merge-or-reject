import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Difficulty, Language } from "./types";
import { requireAdmin } from "./users";

// Add a new code snippet
export const addSnippet = mutation({
  args: {
    language: v.string(),
    volume: v.number(),
    code: v.string(),
    isValid: v.boolean(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await requireAdmin(ctx, identity.subject);

    return await ctx.db.insert("codeSnippets", {
      ...args,
      language: args.language as Language,
      difficulty: args.difficulty as Difficulty,
      createdAt: new Date().toISOString(),
      createdBy: admin._id,
    });
  },
});

// Delete a code snippet
export const deleteSnippet = mutation({
  args: { 
    id: v.id("codeSnippets") 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Verify admin access
    await requireAdmin(ctx, identity.subject);

    await ctx.db.delete(args.id);
  },
});

// Get code snippets for admin dashboard
export const getAdminSnippets = query({
  args: {
    language: v.string(),
    volume: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Verify admin access
    await requireAdmin(ctx, identity.subject);

    return await ctx.db
      .query("codeSnippets")
      .withIndex("by_language_volume", (q) => 
        q.eq("language", args.language as Language).eq("volume", args.volume)
      )
      .collect();
  },
});