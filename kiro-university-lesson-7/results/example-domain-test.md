# Web Test: example.com

Executed with the Playwright MCP server (live browser navigation, not assumed).

- URL: https://example.com/
- Date: 2026-09-27

## Assertions

| Check | Expected | Observed | Result |
| --- | --- | --- | --- |
| Page title | Example Domain | Example Domain | PASS |
| Main heading (h1) | Example Domain | Example Domain | PASS |

## Notes

- Title read from the Playwright navigation result.
- Heading read from the accessibility snapshot as a level-1 heading.
- Page also contains a descriptive paragraph and a "Learn more" link to https://iana.org/domains/example.

Result: all assertions passed.
