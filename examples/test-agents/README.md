# Example: Playwright Test Agents

This example demonstrates how to use Playwright Test Agents (planner, generator, and healer) with Playwright-BDD.

## Setup

1. Generate agent definitions:
```bash
npx bddgen init-agents --loop=vscode
```

2. Install dependencies:
```bash
npm install
```

## Agent Workflow

### 1. 🎭 Planner Agent

The planner explores your application and creates BDD feature files in Gherkin format.

**Usage:**
> "Generate a feature file for adding and completing todos"

**Output:** `features/todo-operations.feature`

### 2. 🎭 Generator Agent

The generator converts Gherkin feature files into step definitions for Playwright-BDD.

**Usage:**
> "Create step definitions from features/todo-operations.feature"

**Output:** `features/steps/todo-operations.ts`

### 3. Generate Test Specs

After creating step definitions, run `npx bddgen` to generate Playwright test specs:

```bash
npx bddgen
```

**Output:** `.features-gen/` directory with generated test files

### 4. 🎭 Healer Agent

The healer automatically fixes failing tests by updating step definitions or selectors.

**Usage:**
> "Fix the failing test for todo operations"

**Output:** Updated step definitions with fixes

## File Structure

```
.github/
  agents/
    planner.md      # Planner agent definition
    generator.md    # Generator agent definition
    healer.md       # Healer agent definition
features/
  seed.feature              # Seed feature for setup
  todo-operations.feature   # BDD feature file (Gherkin)
  steps/
    fixtures.ts             # Custom fixtures
    seed.ts                 # Seed step definitions
    todo-operations.ts      # Step definitions
.features-gen/              # Generated test specs (created by bddgen)
playwright.config.ts        # Playwright-BDD configuration
```

## Running Tests

1. Generate test specs from feature files:
```bash
npx bddgen
```

2. Run the tests:
```bash
npm test
```

## Notes

- The seed feature provides a ready-to-use page context for the agents
- Feature files in `features/` are human-readable Gherkin scenarios
- Step definitions in `features/steps/` are reusable across scenarios
- Generated test specs in `.features-gen/` are created by `npx bddgen`
- The healer can automatically fix selector changes and timing issues in step definitions
