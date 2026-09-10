# Product Vision

Source `.docx`: `docs/Engineering_Work_Journal_Project_Guardrails.docx` (binary, not diffable — this file is the maintained, trackable copy; re-sync if the `.docx` changes). Scope details, fields, and phase breakdowns live in their own docs (linked below) rather than being repeated here.

## Problem

During a quarter, a lot of engineering work gets done — features, bug fixes, investigations, deployments, optimizations, PRs, technical work. It's easy to forget the details by the time a quarterly review with a manager comes around.

## Solution

A lightweight application for recording work while it's still fresh. It starts as a simple, reliable work tracker and progressively evolves into an AI-powered engineering knowledge assistant — see [roadmap.md](roadmap.md) for the phased path.

## Target User

A single engineer (the project's author) who wants a low-friction way to log work throughout a quarter and produce a quarterly review summary from it. This is a personal tool, not a team or organizational product — see Non-Goals below.

## Project Goal

Build a personal Engineering Work Journal that makes it easy to capture everything worked on and turn that into a professional quarterly summary.

## North Star

> Never reach the end of a quarter wondering, "What did I actually do?"

Product principles derived from it:
- Every meaningful piece of work should be captured while it's still fresh.
- Recording a work item should take less than 2–3 minutes.
- Manual tracking comes first; AI and integrations are added only after the core product works.
- Finish the current milestone before expanding scope.

## Long-Term Vision

Beyond V1, the project becomes a personal engineering knowledge and review assistant: manual entries enriched by AI (rewriting, categorization, impact suggestions), searchable via retrieval over journal history, optionally pulling supporting context from tools like GitHub/Jira, and capable of generating a full quarterly review — while the user stays in control and reviews/edits everything AI proposes. See [roadmap.md](roadmap.md) (Phases 4–5) and its cross-reference to the staged AI-learning path for the detailed breakdown.

## Non-Goals

Not part of the MVP, and not planned until explicitly promoted off this list: AI agents, RAG/vector databases, GitHub/Jira/Slack/Teams integrations, mobile app, browser extension, multi-user support, authentication, notifications, complex analytics, Kubernetes/microservices/distributed architecture. Full list and rationale: [roadmap.md](roadmap.md) (Future Ideas).
