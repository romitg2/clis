# Add a command to a CLI

Add a new subcommand to an existing CLI tool.

## Arguments
- $ARGUMENTS: Format "cli-name command-name" (e.g., "my-tool fetch")

## Instructions

1. Parse the arguments to get the CLI name and command name
2. Find the CLI's main entry file at `apps/{cli-name}/src/index.ts`
3. Add a new command using commander's `.command()` method
4. The new command should:
   - Have a descriptive `.description()`
   - Include relevant `.argument()` or `.option()` as appropriate
   - Have an `.action()` handler with a placeholder implementation
5. If the command needs interactive prompts, import from `@inquirer/prompts`
6. Keep the code style consistent with existing commands in the file
