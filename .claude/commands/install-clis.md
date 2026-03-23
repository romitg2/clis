# Build and Install All CLIs

Build all CLI tools and install them globally for local use.

## Instructions

1. Build all CLIs using turbo:
   ```bash
   yarn build
   ```

2. For each CLI in the `apps/` folder, link it globally:
   ```bash
   yarn workspaces foreach -A --include 'apps/*' exec npm link
   ```

3. Verify each CLI is accessible by running `<cli-name> --help`

4. Print a summary of installed CLIs and how to unlink them later:
   ```bash
   npm unlink -g <cli-name>
   ```
