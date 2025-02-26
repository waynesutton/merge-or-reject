# Merge or Reject - Open Source Code Review Game

Merge or Reject is an open source game where developers test their code review skills against AI-generated code snippets. Players must decide whether to merge or reject code based on their analysis, making it a fun way to improve code review abilities.

## Todo

## ✅ To-Do List

- [ ] Add AI and test features with info from addAI.md
- [ ] confirm gameplay.md is correct
- [ ] Add Jamal to admin role in Clerk
- [ ] fix add and edit snippets input box
- [ ] add current program language to show at the top of the current game
- [ ] Test algorithms for merge and reject

- [ ] Add more snippets for programming languages
- [ ] Change the cat to a GIF or video of gameplay
- [ ] Add a short URL link to Convex in the footer
- [ ] Set up hosting on Netlify and add the Netlify widget to the README
- [ ] Buy a domain name and set it up with Netlify and Clerk
- [ ] Future: TBD add code explanation box during game play or after game results.

## 🎮 Game Features

### Authentication & Users

- No login required to play the game
- Anonymous users are created only when starting a game (not on page load)
- Clerk authentication is used only for admin access on the home page
- Admin users can see a logout button on the home page
- User scores and progress are tracked anonymously
- Anonymous users can update their display name after completing a game

### Core Features

- Anonymous user support with persistent scores
- Real-time code snippet validation game
- Multiple programming languages (TypeScript, JavaScript, Python, Java, C++, Rust)
- Three difficulty levels (Easy, Medium, Hard)
- Volume-based content progression
- AI-generated code snippets using GPT-4
- End game functionality with confirmation dialog
- Navigation warnings to prevent accidental game abandonment

### Game Mechanics

- Time-limited rounds based on difficulty:
  - Easy: 120 seconds, 3 rounds
  - Medium: 100 seconds, 5 rounds
  - Hard: 30 seconds, 7 rounds
- Instant feedback on decisions
- Detailed explanations for each snippet
- Score tracking and statistics
- Confetti celebration for perfect scores
- Skip option for difficult snippets
- Visual glitch effect on reject button

### User Features

- Anonymous user creation
- Persistent scores and stats
- Personal best tracking
- Language-specific progress
- User name customization
- Dark/light mode toggle

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
- Edit functionality for existing snippets
- Admin role management

## 🛠 Tech Stack

### Frontend

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- Canvas Confetti for celebrations
- PowerGlitch for visual effects

### Backend

- Convex for serverless backend
- Real-time data synchronization
- OpenAI GPT-4 integration
- Public API access
- Clerk for authentication

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
- `convex/auth.ts` - Authentication handling
- `convex/clerk.ts` - Clerk webhook integration

### Frontend Components

- `src/App.tsx` - Main application
- `src/components/GameContainer.tsx` - Main game logic and UI
- `src/components/GameResult.tsx` - Game completion UI
- `src/components/ScoresPage.tsx` - Leaderboards
- `src/components/CodeDisplay.tsx` - Code display
- `src/components/Timer.tsx` - Game countdown
- `src/components/HomePage.tsx` - Landing page
- `src/components/AdminDashboard.tsx` - Admin interface
- `src/components/Header.tsx` - Navigation header
- `src/components/Footer.tsx` - Page footer

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/merge-or-reject.git
   cd merge-or-reject
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

# Add your OpenAI API key

````

4. Start the development server:
   ```bash
   npm run dev
````

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Convex for backend infrastructure
- React and Vite teams
- All contributors and players!
