# TASK-0009 — Production deployment quota guard

## Problem
Production pushes were invoking two Vercel deployments automatically. Vercel's free deployment API quota rejected the frontend deployment in run 104 and later rejected the backend first in run 106.

## Decision
Keep verification on pull requests and pushes, but move privileged production deployment behind `workflow_dispatch` plus the existing GitHub `Production` environment. Operators can select backend/frontend independently.

## Security / human gates
- no deployment on PR
- no deployment automatically on merge/push
- production environment gate remains intact
- Vercel secrets remain scoped to the deploy job
- no quota error is swallowed or converted to success
- verification jobs remain mandatory workflow predecessors

## Acceptance
- PR CI verifies frontend/backend/orchestration without deploying
- production deployment can only be initiated manually on main
- backend and frontend may be deployed independently to avoid unnecessary quota consumption
