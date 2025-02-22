# Merge or Reject AI Code Review

Merge or Reject AI Code Review - Merge is a game where developers test their code review skills vs AI.

Click Merge if the code is correct, or Reject if you spot any issues. Be quick but careful!
Beat the Clock - Complete the rounds based on difficulty level within the time limit. A perfect score to unlock the confetti celebration!

## Game Mechanics

When a user starts a game:

1. **Game Session Creation**
   - User selects a programming language
   - A new game record is created in the database with:
     ```typescript
     {
       userId: string,           // ID of the player
       language: string,         // Selected language (e.g., "typescript")
       level: number,           // Selected difficulty level (1, 2, or 3)
       score: number,           // Starting at 0
       volume: number,          // Current volume number
       timestamp: string,       // Game start time
       snippetsPlayed: string[], // Array of snippet IDs used in the game
       userAnswers: boolean[]    // Array tracking user's merge/reject decisions
     }
     ```

2. **During Gameplay**
   - The `snippetsPlayed` array tracks which code snippets were shown
   - The `userAnswers` array records whether the user chose to merge (true) or reject (false) each snippet
   - The `score` is updated based on correct decisions
   - Time limits vary by difficulty:
     - Easy: 120 seconds per snippet, 3 rounds total
     - Medium: 100 seconds per snippet, 5 rounds total
     - Hard: 30 seconds per snippet, 7 rounds total

3. **Game Completion**
   - Final score is saved
   - User stats are updated in the `userStats` table
   - Game record serves as a historical record of the play session
   - Confetti celebration triggers for perfect scores:
     - Easy: 3/3 correct
     - Medium: 5/5 correct
     - Hard: 7/7 correct

4. **Volume Progression**
   - Each language has multiple volumes of snippets
   - Players progress through volumes as they complete games
   - New volumes can be unlocked based on performance
   - Each volume contains a mix of:
     - Manually created snippets
     - AI-generated variations
     - Different difficulty levels

This schema enables:
- Individual game session tracking
- Recording of used snippets
- Storage of user decisions
- Game history maintenance
- Accurate statistics and leaderboards

## Features

### Game Features
- Multiple programming languages (TypeScript, JavaScript, Python, Rust, Go, SQL)
- Three difficulty levels with varying time limits and rounds
- Real-time code review with timer
- Score tracking and leaderboards
- Dark/Light mode toggle
- Social sharing options
- Volume-based progression system
- Confetti celebration for perfect scores

### Admin Dashboard Features

#### Code Snippet Management
- View, add, edit, and delete code snippets
- Filter snippets by language and difficulty
- Manage snippet volumes
- Track snippet statistics

#### AI Integration
- Automatic code snippet generation
- Configurable valid/invalid ratio
- Generation limits and controls
- Quality monitoring

#### Game Settings
- Adjust time limits per difficulty
- Configure snippets per game
- Manage volume progression
- Set AI generation parameters

#### Analytics
- Track snippet usage
- Monitor AI-generated content
- View language popularity
- Analyze user performance

## Technical Stack

- React with TypeScript
- Tailwind CSS for styling
- Clerk for authentication
- Convex for database
- OpenAI for AI snippet generation
- Lucide React for icons

## Database Schema

### Tables

1. **users**
   - User profiles and authentication
   - Tracks game progress and achievements

2. **games**
   - Individual game sessions
   - Player decisions and scores

3. **codeSnippets**
   - Code content and metadata
   - AI generation tracking
   - Difficulty and language info

4. **languageVolumes**
   - Volume progression per language
   - Snippet counts and limits

5. **gameSettings**
   - Global game configuration
   - AI generation settings

6. **userStats**
   - Per-language statistics
   - Achievement tracking

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.# merge-or-reject
