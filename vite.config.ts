import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Configure base path for GitHub Pages deployment
  base:
    process.env.NODE_ENV === "production" ? "/NextTrack-Helpdesk-man/" : "/",
  server: {
    port: 3001,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "lucide-react",
      "apexcharts",
      "react-apexcharts",
      "chart.js",
      "react-chartjs-2",
      "recharts",
    ],
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Disable source maps for faster builds
    sourcemap: false,
    // Use esbuild for faster minification
    minify: "esbuild",
    // Target modern browsers for smaller bundles
    target: "esnext",
    // Optimize for production
    cssCodeSplit: true,
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
  },
});
