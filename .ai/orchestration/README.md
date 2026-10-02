# Engineering Agent Orchestration

State machine:
`requirement → planning → architecture → development → review → qa → release_ready → human_approval → done`.

Remediation loops: `review → development`, `qa → development`, and `release_ready → development`.

The orchestrator coordinates six worker roles; it is not a seventh worker. GitHub branches/PRs plus `.ai/tasks/TASK-NNNN/state.json` are shared state.

Production deployment, merge to main, destructive DB operations and final `done` remain human-controlled.
