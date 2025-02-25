// Log the environment variables being used
console.log("Auth Config Environment:", {
  domain: process.env.VITE_CLERK_DOMAIN,
  publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 10) + "...",
});

export default {
  providers: [
    {
      domain: "keen-herring-49.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} as const;
