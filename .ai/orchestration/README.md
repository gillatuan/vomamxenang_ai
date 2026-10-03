# Engineering Agent Orchestration

State machine:
`requirement → planning → architecture → development → review → qa → release_ready → human_approval → done`.

Remediation loops: `review → development`, `qa → development`, and `release_ready → development`.

The orchestrator coordinates six worker roles; it is not a seventh worker. GitHub branches/PRs plus `.ai/tasks/TASK-NNNN/state.json` are shared state.

## Phase 5 task runner

`node .ai/orchestration/task-runner.cjs [state.json ...]` validates task states and emits deterministic JSON handoffs. With no arguments it scans repository task states.

The runner is deliberately dry-run/control-plane only: it does not call an LLM, mutate GitHub, access secrets, touch databases, merge, or deploy. `human_approval` and `done` never dispatch a worker.

Production deployment, merge to main, destructive DB operations and final `done` remain human-controlled.

## Phase 5.2 execution boundary

`node .ai/orchestration/execution-packet.cjs <state.json>` converts a validated dispatch into a versioned execution packet for a future agent runtime. The packet resolves the worker contract, repository context, capabilities, forbidden privileged actions, and mandatory risk context.

Human-gated or completed tasks are non-executable. Phase 5.2 deliberately does not invoke an external model or grant network, secrets, production, merge, or deployment capabilities.

## Phase 5.3 runtime adapter

`node .ai/orchestration/runtime-adapter.cjs <state.json> local` consumes the Phase 5.2 packet, safely loads declared repository context, and produces a versioned local runtime result. Repository path containment prevents context traversal outside the checkout.

Only the deterministic `local` adapter is enabled. External model/provider adapters remain unsupported until a separately reviewed phase introduces credentials, network policy, output validation, cost limits, and mutation controls.

## Phase 5.4 external runtime policy

`external-runtime.cjs` defines the provider-neutral boundary for real model execution. External computation is treated as untrusted: output must match the advisory JSON contract and every proposed action is checked against packet capabilities and forbidden actions.

Normal CI uses only a deterministic mock provider and requires no credential or network access. A live provider must be introduced only through a separately reviewed manual workflow/adapter. Model results cannot mutate the repository in Phase 5.4.
