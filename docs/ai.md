# AI (Phase 4 — Placeholder)

**This document is a placeholder.** AI is Phase 4, after the core journal (Phases 1–2) and the quarterly summary (Phase 3) work without AI. Do not implement anything in this file's scope before then — see CLAUDE.md's rule against scope creep and [roadmap.md](roadmap.md) for phase order. Contents below will be fleshed out when Phase 4 starts.

## AI Features Planned

- Rewrite messy work notes
- Suggest category
- Suggest project
- Suggest impact
- Summarize work
- Group related work
- Identify themes
- Generate quarterly summaries

## AI Architecture

Not designed yet. Anticipated shape (subject to change when this phase actually starts): a small AI-facing module behind the existing FastAPI backend, called by specific endpoints rather than a general-purpose agent loop. Detailed in the staged learning path — [product-vision.md](product-vision.md) Long-Term Vision and [roadmap.md](roadmap.md) Phase 4/5 cross-reference.

## Prompt Strategy

TBD — to be developed alongside the inference/prompt-engineering learning stage (temperature, top-p/top-k, stop sequences, prompt design).

## Structured Outputs

TBD — planned around JSON-schema-validated model responses so AI output can safely populate structured fields (e.g. suggested category/impact) rather than free text.

## AI Failure Handling

One principle is already decided regardless of implementation details: **AI suggests, the user reviews, edits, and accepts.** Nothing AI-generated is auto-applied to a work entry.

## Evaluation Strategy

TBD.

## Privacy Considerations

Work entries may reference internal project names, tickets, and descriptions of internal systems. Whatever AI provider is used later needs its data-handling terms reviewed before real entries are sent to it; a local/offline model is worth considering as an alternative.

## Cost Considerations

TBD — usage is personal-scale (one user, periodic requests), so cost is unlikely to be a major constraint, but the choice of hosted vs. local model should still be made deliberately when this phase starts.
