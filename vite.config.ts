import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Configure base path for GitHub Pages deployment
  base: process.env.NODE_ENV === 'production' ? '/NextTrack-Helpdesk-man/' : '/',
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
