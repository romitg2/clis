# Test a CLI locally

Run a CLI tool directly without linking for quick testing.

## Arguments
- $ARGUMENTS: Format "cli-name [args...]" (e.g., "my-tool greet World")

## Instructions

1. Parse the first argument as the CLI name, rest as CLI arguments
2. Build the CLI first: `yarn workspace {cli-name} build`
3. Run the CLI directly: `node apps/{cli-name}/dist/index.js {remaining args}`
4. Show the output
