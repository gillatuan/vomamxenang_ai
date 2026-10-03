# Architect — TASK-0006

Flow:

`state.json → validate-state → task-runner → execution-packet → future runtime adapter`

The packet is the trust boundary between deterministic orchestration and a future non-deterministic agent runtime. It contains only repository paths/instructions and declared capabilities. It never contains secrets.

All workers are denied merge, production deployment, production migration, destructive production DB operations, secret access, and direct push to main. Human-owned states return a hard stop and cannot produce an executable packet.

This design allows a later adapter (OpenAI/Codex/GitHub-hosted runtime) to consume one stable contract without weakening repository governance.
