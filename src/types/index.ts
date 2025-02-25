import { Id } from "../../convex/_generated/dataModel";

export type Level = 1 | 2 | 3;
export type Language = string;

export interface GameScore {
  id: Id<"games">;
  playerName: string;
  score: number;
  language: Language;
  level: Level;
  timestamp: string;
  volume: number;
}

export const LEVEL_TIMES: Record<Level, number> = {
  1: 120, // Easy
  2: 100, // Medium
  3: 30, // Hard
};

export const LEVEL_ROUNDS: Record<Level, number> = {
  1: 3, // Easy - 1/3 rounds
  2: 5, // Medium - 1/5 rounds
  3: 7, // Hard - 1/7 rounds
};

export const LANGUAGES: Record<Language, string> = {
  typescript: "TypeScript",
  rust: "Rust",
  javascript: "JavaScript",
  python: "Python",
  go: "Go",
  sql: "SQL",
};

export type Difficulty = "easy" | "medium" | "hard";

export interface CodeSnippet {
  language: Language;
  volume: number;
  code: string;
  isValid: boolean;
  difficulty: Difficulty;
  createdAt: string;
  createdBy: Id<"users">;
  explanation: string;
  tags: string[];
  aiGenerated?: boolean;
  baseSnippetId?: Id<"codeSnippets">;
}

export interface User {
  firstName: string;
  username: string;
  profileUrl: string;
  isPrivate: boolean;
  joinedDate: string;
  totalGames: number;
  averageScore: number;
  earnedBadges: string[];
  role: "admin" | "user";
  email: string;
  clerkId: string;
}
