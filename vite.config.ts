import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Configure base path for GitHub Pages deployment
  base:
    process.env.NODE_ENV === "production" ? "/NextTrack-Helpdesk-man/" : "/",
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "lucide-react"],
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          "react-vendor": ["react", "react-dom"],
          "chart-vendor": [
            "apexcharts",
            "react-apexcharts",
            "chart.js",
            "react-chartjs-2",
            "recharts",
            "react-google-charts",
          ],
          "ui-vendor": ["lucide-react", "preline"],
        },
      },
    },
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Use default minification (esbuild is faster)
    minify: "esbuild",
  },
});
