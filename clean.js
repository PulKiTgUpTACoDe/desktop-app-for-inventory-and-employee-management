// clean.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folders to clean
const foldersToClean = [
  "dist",
  "build",
  "out",
  "release",
  "dist-electron",
  "node_modules/.cache",
];

console.log("🧹 Cleaning build and cache folders...\n");

for (const folder of foldersToClean) {
  const fullPath = path.join(__dirname, folder);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`✅ Deleted ${folder}`);
  } else {
    console.log(`⚪ Skipped ${folder} (not found)`);
  }
}

// Clean Electron builder cache (cross-platform)
try {
  execSync("npx electron-builder --clean", { stdio: "inherit" });
} catch {
  console.log("⚠️ electron-builder clean skipped (not installed yet)");
}

console.log("\n✨ Cleanup complete! Ready to build.\n");
