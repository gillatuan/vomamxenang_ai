# TASK-0008 — External AI Runtime Policy

## Goal
Introduce the first real external-model adapter seam while keeping credentials, network use, model output and repository mutation behind explicit policy boundaries.

## Requirements
- Keep normal CI fully offline and secret-free.
- External execution must be opt-in and never run on pull_request/push production CI.
- Build a provider-neutral request envelope from the validated runtime request.
- External model output must conform to a strict JSON result contract before it can be accepted.
- Model output is advisory only in Phase 5.4: no file writes, commits, PRs, merges, deploys or database actions.
- Reject tool/action requests outside the packet capabilities or forbidden actions.
- Never include environment variables, credentials or arbitrary filesystem content in prompts.
- Add deterministic mock-provider tests for valid output, malformed output, forbidden action requests and human hard-stop.
- Document the credential boundary for a later manual workflow.

## Non-goal
TASK-0008 does not store an API key and does not enable a live provider in GitHub Actions.
