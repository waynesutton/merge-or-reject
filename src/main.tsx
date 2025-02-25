import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexProvider } from "convex/react";
import { convex } from "./convex";
import App from "./App";
import "./index.css";

// Debug logging
console.log("App Initialization:", {
  convexUrl: import.meta.env.VITE_CONVEX_URL,
});

// Run version checks
const checkDependencyVersions = async () => {
  try {
    const pkg = await import("../package.json");
    console.log("Package Versions:", {
      convex: pkg.dependencies["convex"],
    });
  } catch (e) {
    console.error("Could not check package versions:", e);
  }
};

checkDependencyVersions();

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "red" }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConvexProvider client={convex}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConvexProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
