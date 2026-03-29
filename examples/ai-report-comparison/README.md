# AI Report Comparison: Token Usage with `promptAttachment` Enabled vs Disabled

This example demonstrates how enabling `aiFix.promptAttachment` in playwright-bdd
significantly reduces the number of tokens an AI model needs to diagnose and fix
a failing test.

## Setup

Two Playwright configs are provided:
- `playwright.report-enabled.config.ts` — `aiFix.promptAttachment: true`
- `playwright.report-disabled.config.ts` — default (no `aiFix`)

The feature file contains 4 scenarios, one of which intentionally fails.

## Run

```bash
# With report enabled (generates AI prompt attachment on failure)
npm run test:report-enabled

# Without report (no AI prompt attachment)
npm run test:report-disabled
```

Both runs expectedly fail on the "Verify API reference navigation" scenario.

## Token Usage Comparison

### With `promptAttachment: true` (~200–400 tokens)

The report attaches a **structured, minimal prompt** containing only what the AI
model needs:

```
You are an expert in Playwright BDD testing.
Fix the error in the BDD scenario.

- Provide response as a diff highlighted code snippet.
- First try to fix test by adjusting Gherkin steps parameters.
...

Failing gherkin scenario:

Scenario: Verify API reference navigation
  Given I am on the Playwright docs site
  When I click the "API" link in the navigation
  Then I see the heading "Playwright Library"
  And I see a list with more than 50 items

Error details:
Expected: 50
Received: 12

Code snippet:
  const items = page.getByRole('main').getByRole('listitem');
  await expect(items).toHaveCount(count);

ARIA snapshot of the page:
  - navigation "Main":
    - link "Docs"
    - link "API"
    ...
```

The AI receives **only** the failing scenario's steps, the error, the relevant
code snippet, and an ARIA snapshot of the page at the moment of failure.

### Without `promptAttachment` (~1500–3000+ tokens)

Without the report feature, the user must manually copy-paste all relevant context
into the AI chat. This typically includes:

1. **The entire feature file** (all 4 scenarios, ~20 lines, ~150 tokens)
2. **All step definitions** (entire `index.ts`, ~45 lines, ~300 tokens)
3. **The fixture setup** (`fixtures.ts`, ~12 lines, ~80 tokens)
4. **The full terminal error output** (with ANSI codes, stack traces, retry info,
   ~50–100 lines, ~500–1000 tokens)
5. **The Playwright config** (~25 lines, ~150 tokens)
6. **Manual description of the page state** or a screenshot (variable, ~200+ tokens
   for description, or unusable for text-based models)

...and the user still needs to write a prompt explaining what they want.

### Summary

| Aspect | Report Enabled | Report Disabled |
|---|---|---|
| Prompt construction | Automatic | Manual |
| Tokens sent to AI | ~200–400 | ~1,500–3,000+ |
| Includes ARIA snapshot | Yes (structured) | No (or manual screenshot) |
| Irrelevant context | Filtered out | Included (all scenarios, all steps) |
| Error formatting | Clean (no ANSI codes) | Raw terminal output |
| Steps included | Only up to failing step | Entire feature file |
| Code snippet | Only relevant lines | Entire step definition files |

### Why This Matters

- **Cost**: At ~$3/M input tokens (GPT-4o), 10 failing tests cost ~$0.004 with
  report vs ~$0.03+ without — a **~7.5x difference** that grows with test complexity.
- **Accuracy**: A focused prompt with an ARIA snapshot gives the AI model more
  relevant signal and less noise, producing better fix suggestions.
- **Speed**: No manual context gathering — just click "Fix with AI" in the report.
