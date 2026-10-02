# TASK-0004 — Agent Orchestration

## Goal
Turn the six engineering agent contracts into an executable, auditable GitHub-centered workflow without adding an autonomous seventh worker.

## Flow
Requirement → Planner → Architect → Developer → Reviewer → QA → DevOps → Human Approval.

## Requirements
- One task state file is the machine-readable source of workflow state.
- Explicit entry/exit criteria and handoff artifacts for every agent.
- Reviewer/QA rejection loops return to Developer.
- Database/security/payment/inventory/pricing changes carry mandatory risk gates.
- DevOps may prepare release but cannot merge or deploy production.
- Human approval remains mandatory for merge, destructive DB work and production.
- State validation runs in CI without secrets or production access.
