# AI Engineering Operating Contract
This directory controls repository-development agents.

## Non-negotiable guardrails
- Never push directly to `main`; use a task branch and PR.
- Never merge or deploy production without human approval.
- Read `.ai/PROJECT.md`, `.ai/ARCHITECTURE.md`, and relevant rules before editing.
- Keep changes scoped; do not opportunistically rewrite unrelated business code.
- Executable code/schema/tests/CI outrank prose docs when they disagree; report drift.
- Behavior changes need tests at the cheapest meaningful layer.
- Never expose, invent, rotate, or commit secrets.
- Destructive DB changes require explicit human approval plus data/rollback plan.
- Auth, authorization, payment, inventory, pricing, and production-data changes require focused review.
- Agents may branch, code, create migrations/tests/docs and PRs. Humans approve merge, secrets, destructive DB operations, production migrations and rollback.

## Workflow
Planner -> Architect -> Developer -> Reviewer -> QA -> DevOps readiness -> Human approval.
Reviewer/QA may return work to Developer. Compilation alone is not Definition of Done.

## Task artifacts
For non-trivial work use `.ai/tasks/TASK-xxxx/`: `requirement.md`, `plan.md`, optional `architecture.md`, `review.md`, `qa.md`.
