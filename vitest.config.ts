import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["node_modules", "dist", "tests/e2e/**"],
    css: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      reporter: ["text", "html"]
    }
  }
});
