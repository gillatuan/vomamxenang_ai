# TASK-0005 — Agent Task Runner

## Goal
Move Phase 4 from a validated state machine to an executable task-control layer that can deterministically inspect tasks, select the next worker role, enforce gates, and emit a machine-readable handoff for future automation.

## Requirements
- No autonomous merge, production deploy, production migration, secret access, or destructive DB action.
- Runner must validate every task state before deciding an action.
- Runner must map workflow status to the six worker roles plus human gate.
- Human-owned `human_approval` and `done` tasks must never be assigned to an engineering agent.
- Risk flags must be surfaced in the handoff, not silently ignored.
- Output must be deterministic JSON suitable for GitHub Actions and future AI-agent invocation.
- CI must test legal routing and human-gate behavior.
