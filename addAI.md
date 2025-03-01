# OpenAI Integration in Code Snippet Review Game

This document explains how OpenAI integration works in this code review game, including setup, configuration, and usage.

## 1. Setup and Configuration

- **OpenAI Dependencies**:

  - Required dependency in `package.json`: `"openai": "^4.28.0"`
  - Environment variable: `VITE_OPENAI_API_KEY` must be set (as shown in SETUP.Md)

- **Core Integration Files**:
  - `convex/snippets.ts`: Contains the AI snippet generation logic
  - `convex/codeSnippets.ts`: Handles public access to code snippets
  - `convex/settings.ts`: Stores AI generation configuration

## 2. Pre-Generation Model

Unlike some AI-integrated applications, this game uses a **pre-generation model**:

- Snippets are generated and stored in advance by administrators
- Generation happens through the Admin Dashboard, not during game start
- This approach provides several benefits:
  - Admin review of content before player exposure
  - Elimination of generation wait times during gameplay
  - Better control over API usage and costs
  - Improved reliability (no dependency on OpenAI availability during gameplay)

## 3. AI Generation Process

The AI generation process follows these steps:

1. Admin triggers generation via the Admin Dashboard for specific language/difficulty
2. System calls `_generateAISnippets` in `convex/snippets.ts`
3. OpenAI's GPT-4 generates code snippets based on the provided prompt:

```typescript
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
```

4. Generated snippets are stored in the database with metadata (language, difficulty, etc.)
5. The snippets are now available for use in games

## 4. Admin Configuration Options

### AI Generation Settings

The Admin Dashboard provides several controls for AI generation:

- **Enable AI Generation**: Toggle to enable/disable AI generation
- **Valid/Invalid Ratio Slider (0.0-1.0)**:
  - Controls what percentage of generated snippets should be valid code
  - 0.0 = All snippets will be invalid (contain bugs)
  - 0.5 = 50% valid, 50% invalid
  - 1.0 = All snippets will be valid (correct code)
  - This ratio is passed directly to the AI prompt to control generation
- **Max Snippets per Generation**: Limits how many snippets are generated in a single request
- **Min Snippets Before Generation**: Sets a threshold for when new snippets should be generated

These settings are stored in the database:

```typescript
aiGeneration: {
  enabled: true,
  validRatio: 0.5,
  maxPerRequest: 5,
  minSnippetsBeforeGeneration: 5,
}
```

### Game Configuration (Separate from AI Generation)

The game configuration settings are separate from AI generation:

- **Time Limits**: How long players have to review each snippet
- **Snippets per Game**: How many snippets are shown during each game session
- **Language Volumes**: Groups of snippets for different languages and difficulty levels

These settings control gameplay parameters but don't directly affect AI generation.

## 5. How Generated Snippets are Used in Gameplay

When a player starts a game:

1. The system retrieves pre-generated snippets matching the selected language and difficulty
2. Snippets are filtered by volume (allowing for content rotation)
3. The game presents these snippets one by one to the player
4. Players must identify if each snippet is valid (should be merged) or invalid (should be rejected)
5. The game tracks player performance and provides feedback

The AI is not involved during actual gameplay - only in the snippet generation process beforehand.

## 6. OpenAI API Cost Considerations

When using this integration, be aware of the following cost considerations:

- **API Usage Costs**: OpenAI charges based on token usage (input and output tokens)
- **Token Optimization**: The pre-generation model helps control costs by:
  - Batching requests (generating multiple snippets per API call)
  - Allowing admins to generate only what's needed
  - Reusing snippets across multiple game sessions
- **Model Selection**: The system currently uses GPT-4, which is more expensive but produces higher quality snippets
- **Rate Limits**: Be aware of OpenAI's rate limits, which may affect bulk generation

## 7. Modifying the System (Advanced)

If you need to modify the system to generate snippets on-demand (during game start):

1. You would need to modify the game startup logic to:

   - Check if enough snippets exist for the requested language/difficulty
   - Generate new snippets if needed before starting the game
   - Handle potential API failures gracefully

2. Consider the tradeoffs:
   - Players would experience delays at game start
   - API costs would be less predictable
   - Game reliability would depend on OpenAI API availability

## 8 system prompt pages and prompt
 all three files have exactly the same system prompt:
✅ src/lib/openai.ts
✅ convex/snippets.ts
✅ convex/codeSnippets.ts 


