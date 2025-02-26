import { mutation, query, action, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Difficulty, Language } from "../src/types";
import { internal } from "./_generated/api";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import OpenAI from "openai";

const openai = new OpenAI();

/**
 * Get code snippets for admin dashboard - public access
 */
export const getAdminSnippets = query({
  args: {
    language: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  },
  returns: v.array(
    v.object({
      _id: v.id("codeSnippets"),
      _creationTime: v.number(),
      language: v.string(),
      volume: v.number(),
      code: v.string(),
      isValid: v.boolean(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
      explanation: v.string(),
      tags: v.array(v.string()),
      aiGenerated: v.optional(v.boolean()),
      createdAt: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("codeSnippets")
      .withIndex("by_language_difficulty", (q) =>
        q.eq("language", args.language as Language).eq("difficulty", args.difficulty)
      )
      .collect();
  },
});

/**
 * Generate AI snippets - internal action
 */
export const _generateAISnippets = internalAction({
  args: {
    language: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    count: v.number(),
    validRatio: v.number(),
  },
  handler: async (ctx, args) => {
    const validCount = Math.round(args.count * args.validRatio);
    const invalidCount = args.count - validCount;

    const prompt = `Generate ${args.count} ${args.language} code snippets:
    - ${validCount} valid snippets
    - ${invalidCount} invalid snippets with subtle bugs
    - Difficulty level: ${args.difficulty}
    - Each snippet should be 5-15 lines
    - Include explanation of why each snippet is valid/invalid
    - Add relevant tags for each snippet
    
    Format each snippet as JSON:
    {
      "code": "code here",
      "isValid": boolean,
      "explanation": "explanation here",
      "tags": ["tag1", "tag2"]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a code review expert who generates code snippets for testing developers' ability to spot bugs.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content in response");

    try {
      const result = JSON.parse(content);
      return result.snippets;
    } catch (error) {
      throw new Error("Failed to parse AI response");
    }
  },
});

/**
 * Add a new code snippet - public access
 */
export const addSnippet = mutation({
  args: {
    language: v.string(),
    volume: v.number(),
    code: v.string(),
    isValid: v.boolean(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    explanation: v.string(),
    tags: v.array(v.string()),
    generateAIVariants: v.optional(v.boolean()),
  },
  returns: v.id("codeSnippets"),
  handler: async (ctx, args) => {
    const language = args.language as Language;
    const difficulty = args.difficulty as Difficulty;

    // Add the base snippet
    const baseSnippetData = {
      language,
      volume: args.volume,
      code: args.code,
      isValid: args.isValid,
      difficulty,
      createdAt: new Date().toISOString(),
      explanation: args.explanation,
      tags: args.tags,
      aiGenerated: false,
    };

    const baseSnippet = await ctx.db.insert("codeSnippets", baseSnippetData);

    // Generate AI variations if requested
    if (args.generateAIVariants) {
      const settings = await ctx.db.query("gameSettings").first();
      if (!settings?.aiGeneration.enabled) return baseSnippet;

      // Schedule AI snippet generation
      await ctx.scheduler.runAfter(0, internal.snippets._generateAndSaveAISnippets, {
        language,
        difficulty,
        volume: args.volume,
        count: settings.aiGeneration.maxPerRequest,
        validRatio: settings.aiGeneration.validRatio,
      });
    }

    return baseSnippet;
  },
});

/**
 * Generate and save AI snippets - internal action
 */
export const _generateAndSaveAISnippets = internalAction({
  args: {
    language: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    volume: v.number(),
    count: v.number(),
    validRatio: v.number(),
  },
  handler: async (ctx, args) => {
    // Generate snippets
    const aiSnippets = await ctx.runAction(internal.snippets._generateAISnippets, {
      language: args.language,
      difficulty: args.difficulty,
      count: args.count,
      validRatio: args.validRatio,
    });

    // Save snippets and update stats
    await ctx.runMutation(internal.snippets._saveGeneratedSnippets, {
      language: args.language,
      difficulty: args.difficulty,
      volume: args.volume,
      snippets: aiSnippets,
    });
  },
});

/**
 * Save generated snippets - internal mutation
 */
export const _saveGeneratedSnippets = internalMutation({
  args: {
    language: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    volume: v.number(),
    snippets: v.array(
      v.object({
        code: v.string(),
        isValid: v.boolean(),
        explanation: v.string(),
        tags: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx: MutationCtx, args) => {
    // Add AI-generated snippets
    for (const snippet of args.snippets) {
      await ctx.db.insert("codeSnippets", {
        language: args.language as Language,
        volume: args.volume,
        code: snippet.code,
        isValid: snippet.isValid,
        difficulty: args.difficulty,
        createdAt: new Date().toISOString(),
        explanation: snippet.explanation,
        tags: snippet.tags,
        aiGenerated: true,
      });
    }

    // Update volume stats
    const volume = await ctx.db
      .query("languageVolumes")
      .withIndex("by_language", (q) => q.eq("language", args.language))
      .first();

    if (volume) {
      await ctx.db.patch(volume._id, {
        snippetCount: volume.snippetCount + args.snippets.length,
        aiGeneratedCount: volume.aiGeneratedCount + args.snippets.length,
        lastAiGeneration: new Date().toISOString(),
      });
    }
  },
});

/**
 * Delete a code snippet - public access
 */
export const deleteSnippet = mutation({
  args: {
    id: v.id("codeSnippets"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const snippet = await ctx.db.get(args.id);
    if (!snippet) throw new Error("Snippet not found");

    // Delete AI-generated variants if this is a base snippet
    if (!snippet.aiGenerated) {
      const variants = await ctx.db
        .query("codeSnippets")
        .withIndex("by_language_difficulty", (q) =>
          q.eq("language", snippet.language as Language).eq("difficulty", snippet.difficulty)
        )
        .filter((q) => q.eq(q.field("aiGenerated"), true))
        .collect();

      for (const variant of variants) {
        await ctx.db.delete(variant._id);
      }
    }

    await ctx.db.delete(args.id);

    // Update language volume counts
    const volume = await ctx.db
      .query("languageVolumes")
      .withIndex("by_language", (q) => q.eq("language", snippet.language as Language))
      .first();

    if (volume) {
      await ctx.db.patch(volume._id, {
        snippetCount: Math.max(0, volume.snippetCount - 1),
        aiGeneratedCount: snippet.aiGenerated
          ? Math.max(0, volume.aiGeneratedCount - 1)
          : volume.aiGeneratedCount,
      });
    }

    return null;
  },
});

export const createSnippet = mutation({
  args: {
    snippet: v.object({
      language: v.string(),
      volume: v.number(),
      code: v.string(),
      isValid: v.boolean(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
      createdAt: v.string(),
      createdBy: v.id("users"),
      explanation: v.string(),
      tags: v.array(v.string()),
      aiGenerated: v.optional(v.boolean()),
      baseSnippetId: v.optional(v.id("codeSnippets")),
    }),
  },
  handler: async (ctx, args) => {
    const { snippet } = args;
    return await ctx.db.insert("codeSnippets", snippet);
  },
});

/**
 * Generate more code snippets using AI - public access
 */
export const generateMoreSnippets = mutation({
  args: {
    language: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    volume: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get AI generation settings
    const settings = await ctx.db.query("gameSettings").first();
    if (!settings?.aiGeneration.enabled) {
      throw new Error("AI generation is disabled");
    }

    // Schedule AI snippet generation
    await ctx.scheduler.runAfter(0, internal.snippets._generateAndSaveAISnippets, {
      language: args.language,
      difficulty: args.difficulty,
      volume: args.volume,
      count: settings.aiGeneration.maxPerRequest,
      validRatio: settings.aiGeneration.validRatio,
    });

    return null;
  },
});
