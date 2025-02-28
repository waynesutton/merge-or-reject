import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Language, Difficulty } from "./types";
import { Id } from "./_generated/dataModel";
import OpenAI from "openai";

const openai = new OpenAI();

/**
 * Get code snippets for a game session - public access
 */
export const getCodeSnippets = query({
  args: {
    language: v.string(),
    volume: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    limit: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("codeSnippets"),
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
      .withIndex("by_language_volume", (q) =>
        q.eq("language", args.language as Language).eq("volume", args.volume)
      )
      .filter((q) => q.eq(q.field("difficulty"), args.difficulty))
      .take(args.limit);
  },
});

/**
 * Generate AI code snippets
 */
async function generateAISnippets(
  language: Language,
  difficulty: Difficulty,
  count: number,
  validRatio: number
): Promise<
  Array<{
    code: string;
    isValid: boolean;
    explanation: string;
    tags: string[];
  }>
> {
  const validCount = Math.round(count * validRatio);
  const invalidCount = count - validCount;

  const prompt = `Generate ${count} ${language} code snippets:
  - ${validCount} valid snippets
  - ${invalidCount} invalid snippets with subtle bugs
  - Difficulty level: ${difficulty}
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
          'You are an expert developer, code review specialist, and coding instructor with deep expertise in TypeScript, JavaScript, Python, Java, C++, Rust, SQL, Go, React, MySQL, database optimization, Convex.dev, LLMs, AI, and full-stack development. Your role is to generate AI-generated code snippets for a game where developers test their ability to spot bugs and validate code quality.\n\nFor each request, you will:\n\t1.\tGenerate a code snippet based on the specified programming language and difficulty level (Easy, Medium, Hard).\n\t2.\tEnsure the code follows best practices for that language.\n\t3.\tIf invalid code is requested, introduce subtle but identifiable issues (syntax errors, logic flaws, security vulnerabilities, performance bottlenecks).\n\t4.\tProvide a clear explanation of why the code is valid or invalid, including a hint that helps the player understand what to look for.\n\t5.\tKeep snippets concise yet meaningful, ensuring they are realistic and engaging for players.\n\nDifficulty Levels:\n\t•\tEasy: Basic syntax, common patterns, and clear mistakes.\n\t•\tMedium: Intermediate concepts with slightly more subtle issues.\n\t•\tHard: Advanced patterns, edge cases, security concerns, performance considerations, and AI-generated hallucinations.\n\nResponse Format (JSON):\n\n{\n  "code": "<generated code snippet>",\n  "explanation": "<detailed reasoning about validity or issues, with a hint>"\n}\n\nEnsure the game remains challenging but fair, helping developers improve their code review skills while making quick decisions under time pressure. The hints should guide players without immediately giving away the answer, allowing them to engage critically with the code.',
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
}

/**
 * Add a new code snippet and optionally generate AI variations - public access
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
    // Add the base snippet
    const baseSnippetId = await ctx.db.insert("codeSnippets", {
      language: args.language as Language,
      volume: args.volume,
      code: args.code,
      isValid: args.isValid,
      difficulty: args.difficulty,
      createdAt: new Date().toISOString(),
      explanation: args.explanation,
      tags: args.tags,
      aiGenerated: false,
    });

    // Generate AI variants if requested
    if (args.generateAIVariants) {
      const settings = await ctx.db.query("gameSettings").first();
      if (!settings?.aiGeneration.enabled) {
        return baseSnippetId;
      }

      const aiSnippets = await generateAISnippets(
        args.language as Language,
        args.difficulty,
        settings.aiGeneration.maxPerRequest,
        settings.aiGeneration.validRatio
      );

      // Add AI-generated snippets
      for (const snippet of aiSnippets) {
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
        .unique();

      if (volume) {
        await ctx.db.patch(volume._id, {
          snippetCount: volume.snippetCount + 1 + aiSnippets.length,
          aiGeneratedCount: volume.aiGeneratedCount + aiSnippets.length,
          lastAiGeneration: new Date().toISOString(),
        });
      }
    }

    return baseSnippetId;
  },
});
