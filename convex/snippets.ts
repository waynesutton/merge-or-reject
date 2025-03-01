import { mutation, query, action, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Difficulty, Language } from "../src/types";
import { internal } from "./_generated/api";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import OpenAI from "openai";
import { requireAdmin } from "./auth";

const openai = new OpenAI();

/**
 * Get code snippets for admin dashboard - admin only
 */
export const getAdminSnippets = query({
  args: {
    language: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    volume: v.number(),
    clerkId: v.string(),
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
    // Verify admin access
    try {
      await requireAdmin(ctx, args.clerkId);
    } catch (error) {
      console.error("Admin access denied:", error);
      return [];
    }

    return await ctx.db
      .query("codeSnippets")
      .withIndex("by_language_volume", (q) =>
        q.eq("language", args.language as Language).eq("volume", args.volume)
      )
      .filter((q) => q.eq(q.field("difficulty"), args.difficulty))
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
    - Include explanation of why each snippet is valid/invalid, with a hint about what to look for
    - Add relevant tags for categorizing the snippet
    
    Format response as JSON with an array of snippets:
    {
      "snippets": [
        {
          "code": "code here",
          "isValid": boolean,
          "explanation": "explanation here with hint",
          "tags": ["tag1", "tag2"]
        },
        // ... more snippets ...
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            'You are an expert developer, code review specialist, and coding instructor with deep expertise in TypeScript, JavaScript, Python, Java, C++, Rust, SQL, Go, React, MySQL, database optimization, Convex.dev, LLMs, AI, and full-stack development. Your role is to generate AI-generated code snippets for a game where developers test their ability to spot bugs and validate code quality.\n\nFor each request, you will:\n\t1.\tGenerate a code snippet based on the specified programming language and difficulty level (Easy, Medium, Hard).\n\t2.\tEnsure the code follows best practices for that language.\n\t3.\tIf invalid code is requested, introduce subtle but identifiable issues (syntax errors, logic flaws, security vulnerabilities, performance bottlenecks).\n\t4.\tProvide a brief explanation that describes what the code does, its structure, and the concepts it uses. Do NOT hint at correctness, validity, or specific issues. The explanation should purely describe the functionality without guiding the user toward an answer.\n\t5.\tKeep snippets concise yet meaningful, ensuring they are realistic and engaging for players.\n\nDifficulty Levels:\n\t•\tEasy: Basic syntax, common patterns, and clear mistakes.\n\t•\tMedium: Intermediate concepts with slightly more subtle issues.\n\t•\tHard: Advanced patterns, edge cases, security concerns, performance considerations, and AI-generated hallucinations.\n\nResponse Format\n\n{\n  "code": "<generated code snippet>",\n  "explanation": "<neutral explanation describing what the code does without suggesting correctness or issues>"\n}\n\nEnsure the game remains challenging but fair, helping developers improve their code review skills while making quick decisions under time pressure. The explanation should be purely descriptive, allowing players to critically analyze the code and make their own judgment without any hints or guidance.',
        },
        {
          role: "user",
          content: prompt,
        },
      ],
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
 * Add a new code snippet - admin only
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
    clerkId: v.string(),
  },
  returns: v.id("codeSnippets"),
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx, args.clerkId);

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
 * Update an existing code snippet - admin only
 */
export const updateSnippet = mutation({
  args: {
    id: v.id("codeSnippets"),
    code: v.string(),
    isValid: v.boolean(),
    explanation: v.string(),
    tags: v.array(v.string()),
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx, args.clerkId);

    const snippet = await ctx.db.get(args.id);
    if (!snippet) throw new Error("Snippet not found");

    // Update the snippet
    await ctx.db.patch(args.id, {
      code: args.code,
      isValid: args.isValid,
      explanation: args.explanation,
      tags: args.tags,
    });

    return null;
  },
});

/**
 * Delete a code snippet - admin only
 */
export const deleteSnippet = mutation({
  args: {
    id: v.id("codeSnippets"),
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx, args.clerkId);

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
 * Generate more code snippets using AI - admin only
 */
export const generateMoreSnippets = mutation({
  args: {
    language: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    volume: v.number(),
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx, args.clerkId);

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

/**
 * Check if snippets are available for a given language and difficulty
 */
export const checkSnippetsAvailability = query({
  args: {
    language: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    // Normalize language to lowercase
    const normalizedLanguage = args.language.toLowerCase();

    // Check if there are any snippets for this language and difficulty
    const snippets = await ctx.db
      .query("codeSnippets")
      .withIndex("by_language_difficulty", (q) =>
        q.eq("language", normalizedLanguage).eq("difficulty", args.difficulty)
      )
      .take(1);

    return snippets.length > 0;
  },
});
