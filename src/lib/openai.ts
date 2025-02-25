import OpenAI from "openai";
import { Language, Difficulty } from "../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert developer and coding instructor specializing in multiple programming languages. Your task is to generate code snippets for a game where users need to identify if the code is valid or contains bugs.

For each request, you will:
1. Generate a code snippet based on the specified language and difficulty
2. Ensure the code follows best practices for that language
3. If invalid code is requested, introduce subtle but identifiable issues
4. Provide a clear explanation of why the code is valid or invalid
5. Keep snippets concise but meaningful

Difficulty levels:
- Easy: Basic syntax, common patterns, clear issues
- Medium: Intermediate concepts, slightly more subtle issues
- Hard: Advanced patterns, edge cases, performance considerations

The response should be in JSON format with:
- code: The code snippet
- explanation: Why it's valid/invalid
- tags: Relevant concepts covered`;

export async function generateCodeSnippet(
  language: Language,
  difficulty: Difficulty,
  shouldBeValid: boolean
): Promise<{
  language: string;
  code: string;
  explanation: string;
  isValid: boolean;
  difficulty: Difficulty;
  createdAt: string;
  tags: string[];
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Generate a ${shouldBeValid ? "valid" : "invalid"} ${language} code snippet at ${difficulty} difficulty level.`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content in response");

  try {
    const result = JSON.parse(content);
    return {
      language,
      code: result.code,
      explanation: result.explanation,
      isValid: shouldBeValid,
      difficulty,
      createdAt: new Date().toISOString(),
      tags: result.tags || [],
    };
  } catch (e) {
    throw new Error("Failed to parse OpenAI response");
  }
}

export async function generateMultipleSnippets(
  language: Language,
  difficulty: Difficulty,
  count: number,
  validRatio: number
): Promise<
  Array<{
    language: string;
    code: string;
    explanation: string;
    isValid: boolean;
    difficulty: Difficulty;
    createdAt: string;
    tags: string[];
  }>
> {
  const validCount = Math.floor(count * validRatio);
  const invalidCount = count - validCount;

  const snippets = await Promise.all([
    ...Array(validCount)
      .fill(null)
      .map(() => generateCodeSnippet(language, difficulty, true)),
    ...Array(invalidCount)
      .fill(null)
      .map(() => generateCodeSnippet(language, difficulty, false)),
  ]);

  return snippets;
}
