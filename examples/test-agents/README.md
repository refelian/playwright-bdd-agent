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

The planner explores your application and creates test plans.

**Usage:**
> "Generate a test plan for adding and completing todos"

**Output:** `specs/todo-operations.md`

### 2. 🎭 Generator Agent

The generator converts test plans into executable tests.

**Usage:**
> "Create Playwright tests from specs/todo-operations.md"

**Output:** `tests/todo-operations.spec.ts`

### 3. 🎭 Healer Agent

The healer automatically fixes failing tests.

**Usage:**
> "Fix the failing test in tests/todo-operations.spec.ts"

**Output:** Updated test file with fixes

## File Structure

```
.github/
  agents/
    planner.md      # Planner agent definition
    generator.md    # Generator agent definition
    healer.md       # Healer agent definition
specs/
  todo-operations.md  # Test plan (human-readable)
tests/
  seed.spec.ts       # Seed test for setup
  todo-operations.spec.ts  # Generated test
```

## Running Tests

```bash
npm test
```

## Notes

- The seed test provides a ready-to-use page context for the agents
- Test plans in `specs/` are human-readable and can be reviewed by stakeholders
- Generated tests follow Playwright best practices
- The healer can automatically fix selector changes and timing issues
