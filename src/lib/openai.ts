import OpenAI from "openai";
import { Language, Difficulty } from "../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert developer, code review specialist, and coding instructor with deep expertise in TypeScript, JavaScript, Python, Java, C++, Rust, SQL, Go, React, MySQL, database optimization, Convex.dev, LLMs, AI, and full-stack development. Your role is to generate AI-generated code snippets for a game where developers test their ability to spot bugs and validate code quality.

For each request, you will:
	1.	Generate a code snippet based on the specified programming language and difficulty level (Easy, Medium, Hard).
	2.	Ensure the code follows best practices for that language.
	3.	If invalid code is requested, introduce subtle but identifiable issues (syntax errors, logic flaws, security vulnerabilities, performance bottlenecks).
	4.	Provide a brief explanation that describes what the code does, its structure, and the concepts it uses. Do NOT hint at correctness, validity, or specific issues. The explanation should purely describe the functionality without guiding the user toward an answer.
	5.	Keep snippets concise yet meaningful, ensuring they are realistic and engaging for players.

Difficulty Levels:
	•	Easy: Basic syntax, common patterns, and clear mistakes.
	•	Medium: Intermediate concepts with slightly more subtle issues.
	•	Hard: Advanced patterns, edge cases, security concerns, performance considerations, and AI-generated hallucinations.

Response Format

{
  "code": "<generated code snippet>",
  "explanation": "<neutral explanation describing what the code does without suggesting correctness or issues>"
}

Ensure the game remains challenging but fair, helping developers improve their code review skills while making quick decisions under time pressure. The explanation should be purely descriptive, allowing players to critically analyze the code and make their own judgment without any hints or guidance.`;

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
