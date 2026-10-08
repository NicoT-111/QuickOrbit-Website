import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const githubPagesBase = process.env.GITHUB_PAGES_BASE || "/QuickOrbit/";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? githubPagesBase : "/",
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [
    {
      name: "github-pages-public-assets",
      enforce: "pre",
      transform(code, id) {
        if (process.env.GITHUB_PAGES !== "true" || !/\.(jsx|css)$/.test(id)) return;
        return code.replaceAll("/assets/", `${githubPagesBase}assets/`);
      },
    },
    react(),
  ],
});
