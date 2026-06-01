import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "**/*.config.ts",
        "**/*.config.mjs",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@components": path.resolve(__dirname, "./components/index.ts"),
      "@hooks": path.resolve(__dirname, "./hooks"),
      "@domain": path.resolve(__dirname, "./domain"),
      "@test-utils": path.resolve(__dirname, "./test-utils"),
      "@context": path.resolve(__dirname, "./context"),
    },
  },
});
