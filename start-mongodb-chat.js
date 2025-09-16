#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log(
  "🚀 Starting NextTrack Helpdesk with MongoDB Chat Integration...\n"
);

// Check if backend dependencies are installed
const fs = require("fs");
const backendPackageJson = path.join(__dirname, "package.json");
const hasBackendDeps = fs.existsSync(
  path.join(__dirname, "node_modules", "express")
);

if (!hasBackendDeps) {
  console.log("📦 Installing backend dependencies...");
  const install = spawn(
    "npm",
    ["install", "express", "mongoose", "cors", "dotenv", "nodemon"],
    {
      stdio: "inherit",
      shell: true,
    }
  );

  install.on("close", (code) => {
    if (code === 0) {
      startServers();
    } else {
      console.error("❌ Failed to install backend dependencies");
      process.exit(1);
    }
  });
} else {
  startServers();
}

function startServers() {
  console.log("🔧 Starting backend server...");

  // Start backend server
  const backend = spawn("node", ["server.js"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NODE_ENV: "development" },
  });

  // Wait a moment for backend to start
  setTimeout(() => {
    console.log("🎨 Starting frontend development server...");

    // Start frontend server
    const frontend = spawn("npm", ["run", "dev"], {
      stdio: "inherit",
      shell: true,
    });

    // Handle process termination
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down servers...");
      backend.kill();
      frontend.kill();
      process.exit(0);
    });

    backend.on("close", (code) => {
      console.log(`Backend server exited with code ${code}`);
    });

    frontend.on("close", (code) => {
      console.log(`Frontend server exited with code ${code}`);
    });
  }, 2000);
}
