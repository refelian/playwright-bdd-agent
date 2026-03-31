# AI Report Comparison: BDD Metadata with `inspectOutput`

This example demonstrates how the `inspectOutput` config option in playwright-bdd
automatically generates a structured JSON file with BDD project metadata — giving
AI tools (code agents, IDE assistants) full context about features, step definitions,
and diagnostics without parsing source files.

## Setup

Two Playwright configs are provided:
- `playwright.report-enabled.config.ts` — includes AI-related options
- `playwright.report-disabled.config.ts` — default (no AI options)

The feature file contains 4 scenarios, one of which intentionally fails.

## Run

```bash
# Run with AI options enabled
npm run test:report-enabled

# Run without AI options
npm run test:report-disabled
```

Both runs expectedly fail on the "Verify API reference navigation" scenario.

You can also use `bddgen inspect` to generate BDD metadata as JSON:

```bash
npx bddgen inspect --json -c playwright.report-enabled.config.ts
```

## What `inspectOutput` Provides

When `inspectOutput` is set in `defineBddConfig()`, running `bddgen test` or
`bddgen inspect` writes a structured JSON file containing:

- **Config** — project paths, feature and step patterns
- **Discovered files** — resolved feature files and step definition files
- **Features** — all scenarios and their steps with keyword types and locations
- **Step definitions** — patterns, locations, and matched steps
- **Diagnostics** — parse errors, missing steps, ambiguous step matches

This metadata is designed for external AI tooling that needs project-wide BDD
context in a stable, machine-readable format.
