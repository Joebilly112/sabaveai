#!/usr/bin/env node
/**
 * Deploy ONLY the interviewdebrief Hosting site on skoolnow-ea6ff.
 * Run from any cwd. This script changes into the app folder first.
 *
 * Without --yes it prints the steps and exits.
 * It never targets another product's site.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const yes = process.argv.includes("--yes");

const steps = [
  "firebase use skoolnow-ea6ff",
  "firebase hosting:sites:create interviewdebrief --project skoolnow-ea6ff",
  "firebase deploy --only hosting --project skoolnow-ea6ff --config firebase.json",
];

console.log("App folder:", appDir);
console.log("Project: skoolnow-ea6ff");
console.log("Hosting site: interviewdebrief");
console.log("Firestore database: interviewdebrief (asia-southeast1)");
console.log("Cost caps: minInstances 0, maxInstances 3, cpu 1, memory 512MiB, concurrency 80");
console.log("");
for (const step of steps) console.log(" ", step);

if (!yes) {
  console.log("");
  console.log("Dry run. Re-run with --yes to deploy hosting for this folder only.");
  process.exit(0);
}

const result = spawnSync(
  "firebase",
  ["deploy", "--only", "hosting", "--project", "skoolnow-ea6ff", "--config", "firebase.json"],
  { cwd: appDir, stdio: "inherit" },
);

process.exit(result.status ?? 1);
