# Build CLI(s)

Build one or all CLI tools in the monorepo.

## Arguments
- $ARGUMENTS: Optional CLI name. If empty, builds all.

## Instructions

1. If a CLI name is provided:
   - Run `yarn workspace {cli-name} build`
2. If no name provided:
   - Run `yarn build` to build all CLIs via turbo

3. Report any TypeScript errors that occur during build
4. On success, show the path to the built executable
