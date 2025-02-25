# Setup Instructions for Merge or Reject

This guide will walk you through setting up the Merge or Reject project from scratch. Follow these steps carefully to get your development environment ready.

## Prerequisites

1. Install required software:
   - [Node.js](https://nodejs.org/) (v18 or higher)
   - [Git](https://git-scm.com/)
   - [Visual Studio Code](https://code.visualstudio.com/)
   - [Cursor](https://cursor.sh/) (AI-powered IDE)

2. Create accounts on:
   - [GitHub](https://github.com/)
   - [Clerk](https://clerk.dev/)
   - [Convex](https://convex.dev/)
   - [OpenAI](https://platform.openai.com/)
   - [Netlify](https://www.netlify.com/)

## Step 1: GitHub Repository Setup

1. Create a new repository on GitHub:
   ```bash
   # Go to github.com
   # Click "New repository"
   # Name it "merge-or-reject"
   # Make it Public
   # Don't initialize with any files
   ```

2. Clone the repository locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/merge-or-reject.git
   cd merge-or-reject
   ```

3. Copy all project files to your local repository:
   ```bash
   # Copy all files from the downloaded project to your local repository
   # Make sure to include hidden files like .gitignore and .env.example
   ```

4. Initialize the repository:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

## Step 2: Environment Setup

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Get your API keys:

   a. Clerk Setup:
   - Go to [clerk.dev](https://clerk.dev)
   - Create a new application
   - Go to API Keys
   - Copy the "Publishable Key"
   - Add to `.env`: `VITE_CLERK_PUBLISHABLE_KEY=your_key`

   b. OpenAI Setup:
   - Go to [platform.openai.com](https://platform.openai.com)
   - Create an account/Login
   - Go to API Keys
   - Create a new key
   - Add to `.env`: `VITE_OPENAI_API_KEY=your_key`

## Step 3: Convex Setup

1. Install Convex CLI:
   ```bash
   npm install -g convex
   ```

2. Initialize Convex:
   ```bash
   npx convex init
   ```
   - Follow the prompts to create a new Convex project
   - Copy the deployment URL to `.env`

3. Deploy the schema:
   ```bash
   npx convex deploy
   ```

## Step 4: Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open Cursor:
   ```bash
   # Open the project in Cursor
   cursor .
   ```

## Step 5: Netlify Deployment

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Initialize Netlify:
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Follow the prompts

3. Configure environment variables:
   - Go to your Netlify site settings
   - Navigate to "Environment variables"
   - Add all variables from your `.env` file

4. Deploy:
   ```bash
   netlify deploy --prod
   ```

## Troubleshooting

Common issues and solutions:

1. **Convex Connection Issues**
   - Ensure your Convex deployment URL is correct in `.env`
   - Check if `npx convex dev` is running

2. **Clerk Authentication Problems**
   - Verify your Clerk publishable key
   - Make sure allowed URLs are configured in Clerk dashboard

3. **Build Errors**
   - Clear the `.convex` directory: `rm -rf .convex`
   - Reinstall dependencies: `npm install`
   - Retry deployment

## Development Workflow

1. Make changes in Cursor
2. Test locally with `npm run dev`
3. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. Netlify will automatically deploy changes

## Additional Resources

- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.dev/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## Need Help?

- Check the GitHub repository issues
- Join our Discord community
- Review the troubleshooting guide above
- Consult the project documentation

Remember to never commit sensitive information like API keys to your repository. Always use environment variables for secrets.