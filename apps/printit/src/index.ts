#!/usr/bin/env node
import { Command } from "commander";
import { confirm, input } from "@inquirer/prompts";
import { execSync, spawnSync } from "child_process";
import { existsSync } from "fs";

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

async function printitCommand(file: string | undefined, options: { scale?: string; yes?: boolean }) {
  let inputFile = file;
  let scale = options.scale || "100";
  let shouldProceed = options.yes ?? true;

  try {
    // If no file provided, ask for it
    if (!inputFile) {
      inputFile = await input({
        message: "Enter file path:",
        validate: (value) => {
          if (!value.trim()) return "Please enter a file path";
          if (!existsSync(value)) return "File not found";
          return true;
        },
      });
    }

    // Validate file exists
    if (!existsSync(inputFile)) {
      console.log(`❌ File not found: ${inputFile}`);
      process.exit(1);
    }

    // Ask for scale if not provided via flag
    if (!options.scale) {
      scale = await input({
        message: "Scale (1-100):",
        default: "100",
        validate: (value) => {
          const num = parseInt(value, 10);
          if (isNaN(num) || num < 1 || num > 100) {
            return "Please enter a number between 1 and 100";
          }
          return true;
        },
      });
    }

    // Confirm (yes by default) if not skipped with -y flag
    if (!options.yes) {
      shouldProceed = await confirm({
        message: `Print "${inputFile}" at ${scale}% scale?`,
        default: true,
      });
    }

    if (!shouldProceed) {
      console.log("👋 Cancelled");
      return;
    }
  } catch (error) {
    handleExit(error);
    return;
  }

  console.log(`\n🖨️  Printing "${inputFile}" at ${scale}% scale...\n`);

  // Call the printit zsh function
  const result = spawnSync("zsh", ["-ic", `printit "${inputFile}" --scale ${scale}`], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const program = new Command();

program
  .name("printit")
  .description("Print markdown files with scale options")
  .version("0.0.1")
  .argument("[file]", "Markdown file to print")
  .option("-s, --scale <percent>", "Scale percentage (1-100)")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(printitCommand);

program.parse();
