// Log the environment variables being used
console.log("Auth Config Environment:", {
  domain: process.env.VITE_CLERK_DOMAIN,
  publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 10) + "...",
});

// Hardcoded configuration for simplicity
// In a production environment, you would use environment variables
export default {
  providers: [
    {
      domain: "keen-herring-49.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} as const;
