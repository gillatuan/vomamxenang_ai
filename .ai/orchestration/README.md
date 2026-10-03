# Engineering Agent Orchestration

State machine:
`requirement → planning → architecture → development → review → qa → release_ready → human_approval → done`.

Remediation loops: `review → development`, `qa → development`, and `release_ready → development`.

The orchestrator coordinates six worker roles; it is not a seventh worker. GitHub branches/PRs plus `.ai/tasks/TASK-NNNN/state.json` are shared state.

## Phase 5 task runner

`node .ai/orchestration/task-runner.cjs [state.json ...]` validates task states and emits deterministic JSON handoffs. With no arguments it scans repository task states.

The runner is deliberately dry-run/control-plane only: it does not call an LLM, mutate GitHub, access secrets, touch databases, merge, or deploy. `human_approval` and `done` never dispatch a worker.

Production deployment, merge to main, destructive DB operations and final `done` remain human-controlled.
