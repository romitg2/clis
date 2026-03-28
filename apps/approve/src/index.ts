#!/usr/bin/env node
import { Command } from "commander";
import { checkbox, confirm, select, input } from "@inquirer/prompts";
import { execSync } from "child_process";

const LABELS = ["ready-for-e2e", "run-ci"];

function isExitPromptError(error: unknown): boolean {
  return error instanceof Error && error.name === "ExitPromptError";
}

function handleExit(error: unknown): void {
  if (isExitPromptError(error)) {
    console.log("\n👋 Cancelled");
    process.exit(0);
  }
  throw error;
}

function run(cmd: string, silent = false): string {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: silent ? "pipe" : "inherit" }).toString().trim();
  } catch {
    return "";
  }
}

function runWithOutput(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).toString().trim();
  } catch {
    return "";
  }
}

function getCurrentPR(): string | null {
  const result = runWithOutput("gh pr view --json number --jq '.number'");
  return result || null;
}

function extractPRNumber(url: string): string | null {
  // Match patterns like https://github.com/owner/repo/pull/12345
  const match = url.match(/\/pull\/(\d+)/);
  return match ? match[1] : null;
}

async function approvePR() {
  let prNumber: string | null = null;
  let selectedLabels: string[];
  let enableAutoMerge: boolean;

  try {
    // Step 0: Select which PR to approve
    const currentPR = getCurrentPR();
    const prSource = await select({
      message: "Which PR to approve?",
      choices: [
        {
          name: currentPR ? `Current branch (PR #${currentPR})` : "Current branch (no PR found)",
          value: "current",
          disabled: !currentPR,
        },
        {
          name: "Enter PR link",
          value: "link",
        },
      ],
      default: "current",
    });

    if (prSource === "current") {
      prNumber = currentPR;
    } else {
      const prLink = await input({
        message: "Enter PR link:",
        validate: (value) => {
          if (!value.trim()) return "Please enter a PR link";
          if (!extractPRNumber(value)) return "Invalid PR link. Expected format: https://github.com/owner/repo/pull/12345";
          return true;
        },
      });
      prNumber = extractPRNumber(prLink);
    }

    if (!prNumber) {
      console.log("❌ No PR found");
      process.exit(1);
    }

    console.log(`\n🔍 PR #${prNumber}\n`);

    // Step 1: Select labels
    selectedLabels = await checkbox({
      message: "Select labels to add:",
      choices: LABELS.map((label) => ({
        name: label,
        value: label,
        checked: true,
      })),
    });

    // Step 2: Auto-merge squash option
    enableAutoMerge = await confirm({
      message: "Enable auto-merge (squash)?",
      default: true,
    });
  } catch (error) {
    handleExit(error);
    return;
  }

  console.log("\n📋 Summary:");
  console.log(`   PR: #${prNumber}`);
  console.log(`   Labels: ${selectedLabels.length > 0 ? selectedLabels.join(", ") : "none"}`);
  console.log(`   Auto-merge: ${enableAutoMerge ? "yes" : "no"}`);
  console.log("");

  // Step 3: Update branch with main
  console.log("🔄 Updating branch with main...");
  run("gh pr update-branch --rebase");

  // Step 4: Approve PR
  console.log("✅ Approving PR...");
  run(`gh pr review ${prNumber} --approve`);

  // Step 5: Remove existing labels first, then add
  if (selectedLabels.length > 0) {
    console.log(`🏷️  Adding labels: ${selectedLabels.join(", ")}...`);
    run(`gh pr edit ${prNumber} --remove-label "${selectedLabels.join(",")}"`, true);
    run(`gh pr edit ${prNumber} --add-label "${selectedLabels.join(",")}"`);
  }

  // Step 6: Enable auto-merge squash
  if (enableAutoMerge) {
    console.log("🔀 Enabling auto-merge (squash)...");
    run(`gh pr merge ${prNumber} --auto --squash`);
  }

  console.log("\n🎉 Done!");
}

const program = new Command();

program
  .name("approve")
  .description("Approve a PR with labels and auto-merge options")
  .version("0.0.1")
  .action(approvePR);

program.parse();
