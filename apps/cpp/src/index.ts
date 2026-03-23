#!/usr/bin/env node
import { Command } from "commander";
import { select, input } from "@inquirer/prompts";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { execSync } from "child_process";

const CP_TEMPLATE = `#include <bits/stdc++.h>
using namespace std;

#define endl '\\n'
#define ll long long
#define all(a) (a).begin(), (a).end()

void solve() {

}

int main() {
  ios_base::sync_with_stdio(false);
  cin.tie(NULL);

  int t = 1;
  // cin >> t;

  while (t--) {
    solve();
  }

  return 0;
}
`;

const BASE_PATH = join(homedir(), "C++");

interface CreateOptions {
  platform: "atcoder" | "cf";
  name: string;
  last: string;
  open?: boolean;
}

function createContest(opts: CreateOptions): { success: boolean; path?: string; files?: string[]; error?: string } {
  const platformDir = opts.platform === "atcoder" ? "atcoder" : "codeforces";
  const contestPath = join(BASE_PATH, platformDir, opts.name);

  if (existsSync(contestPath)) {
    return { success: false, error: `Folder already exists: ${contestPath}` };
  }

  mkdirSync(contestPath, { recursive: true });

  const isNumeric = /^\d+$/.test(opts.last);
  const files: string[] = [];

  if (isNumeric) {
    const count = parseInt(opts.last, 10);
    for (let i = 0; i < count; i++) {
      files.push(String.fromCharCode(65 + i));
    }
  } else {
    const endChar = opts.last.toUpperCase().charCodeAt(0);
    for (let i = 65; i <= endChar; i++) {
      files.push(String.fromCharCode(i));
    }
  }

  for (const file of files) {
    const filePath = join(contestPath, `${file}.cpp`);
    writeFileSync(filePath, CP_TEMPLATE);
  }

  return { success: true, path: contestPath, files };
}

function openFolder(path: string) {
  execSync(`cd "${path}" && nvim .`, { stdio: "inherit" });
}

const program = new Command();

program
  .name("cpp")
  .description("Initialize competitive programming contest folders")
  .version("0.0.1");

// Interactive mode
program
  .command("init")
  .description("Create contest folder interactively")
  .action(async () => {
    const platform = await select({
      message: "Select platform:",
      choices: [
        { name: "AtCoder", value: "atcoder" as const },
        { name: "Codeforces", value: "cf" as const },
      ],
    });

    const name = await input({
      message: "Contest/folder name (e.g., abc350, round950):",
    });

    const last = await input({
      message: "Last problem (e.g., F, G, H or 6, 7, 8):",
      default: "F",
    });

    const result = createContest({ platform, name, last });

    if (!result.success) {
      console.log(`\n❌ ${result.error}`);
      return;
    }

    console.log(`\n✅ Created ${result.files!.length} files in ${result.path}`);
    console.log(`   Files: ${result.files!.map((f) => f + ".cpp").join(", ")}`);

    openFolder(result.path!);
  });

// Non-interactive mode for scripting/testing
program
  .command("create")
  .description("Create contest folder (non-interactive)")
  .requiredOption("-p, --platform <platform>", "Platform: atcoder or cf")
  .requiredOption("-n, --name <name>", "Contest name")
  .option("-l, --last <last>", "Last problem letter or count", "F")
  .option("--no-open", "Don't open folder after creation")
  .action((opts: { platform: string; name: string; last: string; open: boolean }) => {
    if (opts.platform !== "atcoder" && opts.platform !== "cf") {
      console.error("❌ Platform must be 'atcoder' or 'cf'");
      process.exit(1);
    }

    const result = createContest({
      platform: opts.platform as "atcoder" | "cf",
      name: opts.name,
      last: opts.last,
    });

    if (!result.success) {
      console.log(`❌ ${result.error}`);
      process.exit(1);
    }

    console.log(`✅ Created ${result.files!.length} files in ${result.path}`);
    console.log(`   Files: ${result.files!.map((f) => f + ".cpp").join(", ")}`);

    if (opts.open) {
      openFolder(result.path!);
    }
  });

// Default to interactive init
program.action(async () => {
  await program.commands[0].parseAsync([]);
});

program.parse();

export { createContest, CP_TEMPLATE, BASE_PATH };
