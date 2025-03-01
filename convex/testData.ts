/**
 * testData.ts
 *
 * This file contains functions to seed test data into the database.
 *
 * Changes made:
 * - Created addTestSnippets mutation to add sample code snippets
 * - Added snippets for multiple languages and difficulty levels
 * - Added support for React and SQL languages
 * - Improved snippet count updating for all languages
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Language } from "../src/types";

// Helper function to generate random valid or invalid code snippets
const generateSnippet = (language: string, isValid: boolean): string => {
  if (language === "typescript") {
    return isValid
      ? `function add(a: number, b: number): number {
  return a + b;
}`
      : `function add(a: number, b: number): number {
  return a - b; // Wrong implementation
}`;
  } else if (language === "javascript") {
    return isValid
      ? `function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`
      : `function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item, 0); // Missing price property
}`;
  } else if (language === "python") {
    return isValid
      ? `def is_prime(num):
    if num <= 1:
        return False
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            return False
    return True`
      : `def is_prime(num):
    if num <= 1:
        return False
    for i in range(2, num): # Inefficient check
        if num % i == 0:
            return False
    return True`;
  } else if (language === "react") {
    // Enhanced React examples with more variety
    if (isValid) {
      // Create several different valid React snippets to ensure diversity
      const validOptions = [
        // Simple counter component (easy)
        `function Counter() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
        // Simple greeting component (easy)
        `function Greeting({ name }) {
  return (
    <div className="greeting">
      <h2>Hello, {name || 'Guest'}!</h2>
      <p>Welcome to our application</p>
    </div>
  );
}`,
        // Toggle component (easy)
        `function Toggle() {
  const [isOn, setIsOn] = React.useState(false);
  
  return (
    <button 
      className={isOn ? 'toggle-on' : 'toggle-off'}
      onClick={() => setIsOn(!isOn)}
    >
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}`,
        // Form input (medium)
        `function NameForm() {
  const [name, setName] = React.useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Submitted name: ' + name);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}`,
      ];

      // Select a random valid option
      return validOptions[Math.floor(Math.random() * validOptions.length)];
    } else {
      // Create several different invalid React snippets
      const invalidOptions = [
        // Invalid onClick handler (easy)
        `function Counter() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={setCount(count + 1)}> {/* Incorrect usage of onClick */}
        Increment
      </button>
    </div>
  );
}`,
        // Missing key in list (easy)
        `function TodoList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li>{item.text}</li> {/* Missing key prop */}
      ))}
    </ul>
  );
}`,
        // Direct state mutation (easy)
        `function Counter() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => { count++; }}> {/* Direct state mutation */}
        Increment
      </button>
    </div>
  );
}`,
      ];

      // Select a random invalid option
      return invalidOptions[Math.floor(Math.random() * invalidOptions.length)];
    }
  } else if (language === "sql") {
    return isValid
      ? `SELECT users.name, orders.order_date
FROM users
JOIN orders ON users.id = orders.user_id
WHERE orders.total > 100
ORDER BY orders.order_date DESC;`
      : `SELECT users.name, orders.order_date
FROM users
INNER JOIN orders ON users.name = orders.user_id -- Incorrect join condition
WHERE orders.total > 100
ORDER BY orders.order_date DESC;`;
  } else {
    return isValid
      ? `// Valid ${language} code sample
function process() {
  console.log("Valid code");
  return true;
}`
      : `// Invalid ${language} code sample
function process() {
  console.log("Invalid code");
  returnfalse; // Missing space
}`;
  }
};

/**
 * Add test code snippets for different languages and difficulties
 */
export const addTestSnippets = mutation({
  args: {
    clerkId: v.string(),
  },
  returns: v.object({
    addedCount: v.number(),
    languages: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    // Verify if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized. Only admins can add test data.");
    }

    console.log("Starting to add test snippets...");

    // Get all existing languages from the database
    const existingLanguageVolumes = await ctx.db.query("languageVolumes").collect();
    const existingLanguages = existingLanguageVolumes.map((vol) => vol.language);

    // Default languages to add test data for if none exist
    let languages = ["typescript", "javascript", "python", "go", "rust", "react", "sql"];

    // If we have existing languages, use those instead
    if (existingLanguages.length > 0) {
      languages = existingLanguages as string[];
      console.log(`Found ${languages.length} existing languages: ${languages.join(", ")}`);
    } else {
      console.log(`No existing languages found. Using default list: ${languages.join(", ")}`);
    }

    // Difficulties to add test data for
    const difficulties = ["easy", "medium", "hard"];

    let addedCount = 0;
    const updatedLanguages: string[] = [];

    // For each language, add snippets for each difficulty
    for (const language of languages) {
      // Ensure the language is consistently normalized to lowercase
      const normalizedLanguage = language.toLowerCase();
      console.log(`Processing language: ${normalizedLanguage} (original: ${language})`);

      // Check if language volume exists
      let languageVolume = await ctx.db
        .query("languageVolumes")
        .withIndex("by_language", (q) => q.eq("language", normalizedLanguage))
        .unique();

      // If language volume doesn't exist, create it
      if (!languageVolume) {
        console.log(`Creating new language volume for: ${normalizedLanguage}`);
        const volumeId = await ctx.db.insert("languageVolumes", {
          language: normalizedLanguage as Language,
          currentVolume: 1,
          snippetCount: 0,
          aiGeneratedCount: 0,
          lastAiGeneration: new Date().toISOString(),
          status: "active",
        });
        languageVolume = await ctx.db.get(volumeId);
      }

      // Add more snippets for React to ensure we have enough
      const snippetsPerDifficulty = normalizedLanguage === "react" ? 8 : 5;

      // Add snippets for each difficulty
      for (const difficulty of difficulties) {
        console.log(`Adding ${difficulty} snippets for ${normalizedLanguage}`);

        // For React, add more valid examples for the easy difficulty to ensure we have enough
        const validCount = normalizedLanguage === "react" && difficulty === "easy" ? 5 : 3;
        const invalidCount = snippetsPerDifficulty - validCount;

        // Add valid snippets
        for (let i = 0; i < validCount; i++) {
          await ctx.db.insert("codeSnippets", {
            language: normalizedLanguage as Language,
            volume: languageVolume!.currentVolume,
            code: generateSnippet(normalizedLanguage, true),
            isValid: true,
            difficulty: difficulty as "easy" | "medium" | "hard",
            explanation: `This is a valid ${normalizedLanguage} code snippet for ${difficulty} difficulty.`,
            tags: [normalizedLanguage, difficulty, "valid"],
            aiGenerated: false,
            createdAt: new Date().toISOString(),
          });

          addedCount++;
        }

        // Add invalid snippets
        for (let i = 0; i < invalidCount; i++) {
          await ctx.db.insert("codeSnippets", {
            language: normalizedLanguage as Language,
            volume: languageVolume!.currentVolume,
            code: generateSnippet(normalizedLanguage, false),
            isValid: false,
            difficulty: difficulty as "easy" | "medium" | "hard",
            explanation: `This ${normalizedLanguage} code has an error: implementation doesn't match expected behavior`,
            tags: [normalizedLanguage, difficulty, "invalid"],
            aiGenerated: false,
            createdAt: new Date().toISOString(),
          });

          addedCount++;
        }
      }

      // Update snippet count for this language
      const snippets = await ctx.db
        .query("codeSnippets")
        .withIndex("by_language_difficulty", (q) =>
          q.eq("language", normalizedLanguage as Language)
        )
        .collect();

      console.log(`Found ${snippets.length} total snippets for ${normalizedLanguage}`);

      await ctx.db.patch(languageVolume!._id, {
        snippetCount: snippets.length,
      });

      updatedLanguages.push(normalizedLanguage);
    }

    console.log(`Added ${addedCount} snippets across ${updatedLanguages.length} languages`);
    return {
      addedCount,
      languages: updatedLanguages,
    };
  },
});
