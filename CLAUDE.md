# Engineering Work Journal

## Project Goal

Build a personal engineering work journal that helps me
capture my work and generate quarterly performance summaries.

## Current Milestone

V1 - Core Work Tracking

## Current Objective

Build the ability to:

- Create work entries
- View work entries
- Edit work entries
- Delete work entries
- Search work entries
- Filter work entries

## Important Rules

1. Do not implement features outside the current milestone.
2. Do not move to AI functionality until V1 is complete.
3. Do not introduce new dependencies without explaining why.
4. Prefer simple architecture over unnecessary abstraction.
5. Before making significant architectural changes, explain the tradeoffs.
6. Keep documentation updated when architecture changes.
7. Do not rewrite working code unnecessarily.
8. If a requested feature is outside the current milestone, tell me
   and add it to the "Future Ideas" section instead of implementing it.

## Development Approach

Work incrementally.

Before coding:
1. Understand the requirement.
2. Inspect the existing code.
3. Explain the implementation plan.
4. Implement the smallest useful change.
5. Test the change.
6. Update documentation if necessary.

## Future Ideas

- AI-generated quarterly performance summaries (next milestone after V1).
- Multi-user / auth / cloud hosting.
- Tags as a normalized table, tag autocomplete/rename.
- Full-text search (SQLite FTS5) if substring search proves insufficient.
