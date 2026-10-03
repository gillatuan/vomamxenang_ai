# Architect — TASK-0005

The task runner is a deterministic control-plane adapter, not an autonomous agent.

`state.json -> validate-state.cjs -> task-runner.cjs -> JSON handoff`

Status ownership:
- requirement/planning -> Planner
- architecture -> Architect
- development -> Developer
- review -> Reviewer
- qa -> QA
- release_ready -> DevOps
- human_approval/done -> no worker; Human gate

The runner reads repository artifacts only and performs no network, GitHub mutation, database, deployment or secret operation. This keeps Phase 5 safe while creating the stable interface needed for later agent execution.
