# Planner — TASK-0005

1. Add a deterministic repository-local task runner.
2. Reuse the Phase 4 state validator instead of duplicating transition validation.
3. Produce a JSON handoff containing task, status, next role, artifacts and risk gates.
4. Add unit tests for normal routing, review/QA routing, human approval and done.
5. Add a CI job that runs the runner tests and performs a dry-run scan of repository tasks.
6. Keep execution dry-run only in Phase 5; actual LLM/API invocation is a later controlled integration.
