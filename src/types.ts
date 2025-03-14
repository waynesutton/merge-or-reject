/**
 * types.ts
 *
 * Changes made:
 * - Removed default Language object and predefined Language type
 * - Updated Language type to be a string type instead of a union
 * - Kept all other type definitions and constants unchanged
 * - Added LANGUAGES export that was missing
 */

import { Id } from "../convex/_generated/dataModel";

export type Language = string;

export type Level = 1 | 2 | 3;

export type Difficulty = "easy" | "medium" | "hard";

// Badge type definition
export type Badge = {
  name: string;
  description: string;
  emoji: string;
};

// Added LANGUAGES mapping
export const LANGUAGES: Record<string, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  go: "Go",
  rust: "Rust",
  csharp: "C#",
  Cpp: "c++",
  react: "React",
  sql: "SQL",
};

export const LEVEL_TIMES = {
  1: 120, // Easy: 2 minutes
  2: 90, // Medium: 1.5 minutes
  3: 60, // Hard: 1 minute
} as const;

// Number of rounds per difficulty level
export const LEVEL_ROUNDS = {
  1: 3, // Easy: 3 rounds
  2: 5, // Medium: 5 rounds
  3: 7, // Hard: 7 rounds
} as const;

// Mapping between levels and difficulties
export const LEVEL_DIFFICULTIES: Record<Level, Difficulty> = {
  1: "easy",
  2: "medium",
  3: "hard",
} as const;

export type GameScore = {
  id: Id<"games">;
  playerName: string;
  score: number;
  language: string;
  level: number;
  timestamp: string;
  totalSnippets: number;
};

export type CodeSnippet = {
  id: Id<"codeSnippets">;
  code: string;
  language: Language;
  isValid: boolean;
  difficulty: Difficulty;
  explanation: string;
  volume: number;
};
