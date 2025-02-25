import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL is not set");
}

// Debug logging
console.log("Convex Setup:", {
  url: convexUrl,
});

export const convex = new ConvexReactClient(convexUrl);
