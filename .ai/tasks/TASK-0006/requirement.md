# TASK-0006 — Agent Execution Contract

## Goal
Turn Phase 5 routing output into a deterministic execution packet that a real agent runtime can consume, while keeping all privileged actions behind existing human gates.

## Requirements
- Build an execution packet only after state validation/routing.
- Load the selected worker contract from `.ai/agents/<role>.md`.
- Include project/architecture/rule context and task artifacts as explicit file references.
- Define capabilities and forbidden actions per worker; default deny privileged operations.
- Human-gated states must produce no executable agent packet.
- Risk flags must become mandatory review context.
- Packet generation must be local/deterministic and require no secrets/network/API key.
- CI tests must prove role selection, human hard-stop, missing-contract failure and risk propagation.

## Non-goal
Phase 5.2 does not autonomously call an external LLM, write code, mutate GitHub, merge, deploy, or touch production data. It defines and verifies the safe execution boundary for that later adapter.
