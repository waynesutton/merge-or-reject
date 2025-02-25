# Merge or Reject - Open Source Code Review Game

Merge or Reject is an open source game where developers test their code review skills against AI-generated code snippets. Players must decide whether to merge or reject code based on their analysis, making it a fun way to improve code review abilities.

## 🎮 Game Features

### Core Features

- Anonymous user support with persistent scores
- Real-time code snippet validation game
- Multiple programming languages (TypeScript, JavaScript, Python, Java, C++, Rust)
- Three difficulty levels (Easy, Medium, Hard)
- Volume-based content progression
- AI-generated code snippets using GPT-4

### Game Mechanics

- Time-limited rounds based on difficulty:
  - Easy: 120 seconds, 3 rounds
  - Medium: 100 seconds, 5 rounds
  - Hard: 30 seconds, 7 rounds
- Instant feedback on decisions
- Detailed explanations for each snippet
- Score tracking and statistics
- Confetti celebration for perfect scores

### User Features

- Anonymous user creation
- Persistent scores and stats
- Personal best tracking
- Language-specific progress

### Social Features

- Global leaderboards
- Recent games feed
- Share scores on social media
- Volume progression tracking

### Admin Features

- Dashboard with game statistics
- Code snippet management
- AI snippet generation control
- Volume and difficulty management

## 🛠 Tech Stack

### Frontend

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- Canvas Confetti for celebrations

### Backend

- Convex for serverless backend
- Real-time data synchronization
- OpenAI GPT-4 integration
- Public API access

### Database

- Convex's built-in database
- Real-time subscriptions
- Optimized indexes
- Automatic scaling

## 📁 Project Structure

### Convex Backend

- `convex/schema.ts` - Database schema definition
- `convex/game.ts` - Game session management
- `convex/games.ts` - Game creation and retrieval
- `convex/scores.ts` - Score tracking and leaderboards
- `convex/users.ts` - Anonymous user management
- `convex/snippets.ts` - Code snippet management
- `convex/admin.ts` - Admin dashboard functions
- `convex/settings.ts` - Game configuration
- `convex/init.ts` - Initial setup

### Frontend Components

- `src/App.tsx` - Main application
- `src/components/GameResult.tsx` - Game completion UI
- `src/components/ScoresPage.tsx` - Leaderboards
- `src/components/CodeDisplay.tsx` - Code display
- `src/components/Timer.tsx` - Game countdown
- `src/components/HomePage.tsx` - Landing page

## 🚀 Getting Started

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/merge-or-reject.git
   cd merge-or-reject
   \`\`\`

2. Install dependencies:
   \`\`\`bash
npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env

# Add your OpenAI API key

\`\`\`

4. Start the development server:
   \`\`\`bash
npm run dev
   \`\`\`

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Convex for backend infrastructure
- React and Vite teams
- All contributors and players!
