# Create a new CLI

Create a new CLI tool in the monorepo with the given name.

## Arguments
- $ARGUMENTS: The name of the CLI (e.g., "my-tool")

## Instructions

1. Create a new folder at `apps/$ARGUMENTS/`
2. Create the following structure:
   ```
   apps/$ARGUMENTS/
   ├── package.json
   ├── tsconfig.json
   └── src/
       └── index.ts
   ```

3. The `package.json` should include:
   - name: `$ARGUMENTS`
   - type: "module"
   - bin pointing to `./dist/index.js`
   - scripts: build, dev, clean
   - dependencies: commander, @inquirer/prompts
   - devDependencies: @types/node, typescript

4. The `tsconfig.json` should extend the root tsconfig

5. The `src/index.ts` should:
   - Have the shebang `#!/usr/bin/env node`
   - Import commander and set up a basic CLI with name, description, version
   - Include a sample command as a starting point

6. Run `yarn install` to install dependencies

7. Print instructions on how to build and link the CLI for local testing
