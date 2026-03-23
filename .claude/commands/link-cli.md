# Link CLI for local use

Link a CLI tool globally so it can be used from anywhere on the system.

## Arguments
- $ARGUMENTS: The name of the CLI to link

## Instructions

1. First build the CLI: `yarn workspace $ARGUMENTS build`
2. Navigate to the CLI's directory: `apps/$ARGUMENTS`
3. Run `yarn link` or `npm link` to create a global symlink
4. Test that the CLI is accessible by running `$ARGUMENTS --help`
5. Print instructions for unlinking later if needed
