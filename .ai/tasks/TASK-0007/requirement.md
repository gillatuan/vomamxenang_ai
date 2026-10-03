# TASK-0007 — Agent Runtime Adapter

## Goal
Add the first executable runtime adapter behind the Phase 5.2 execution-packet boundary. The adapter must be provider-agnostic and safe by default, with a local deterministic runtime used by CI.

## Requirements
- Consume only a Phase 5.2 execution packet; never route directly from unvalidated task input.
- Refuse non-executable/human-gated packets.
- Load declared repository context and worker contract with path-containment checks.
- Produce a versioned runtime request/result contract.
- Default runtime is local dry-run; CI must not require API keys or network.
- External provider execution is an explicit adapter seam, disabled unless separately configured and reviewed.
- Runtime has no direct GitHub mutation, secret, production, merge, deploy or production-DB capability.
- Tests cover developer execution, human hard-stop, path traversal rejection, and risk propagation.

## Non-goal
No autonomous code mutation or external LLM call is enabled in TASK-0007.
