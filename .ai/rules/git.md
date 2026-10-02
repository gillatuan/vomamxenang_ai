# Git and PR Rules
- No direct agent commits to `main`.
- Branches: `feat/<task>-<slug>`, `fix/<task>-<slug>`, `chore/<task>-<slug>`.
- Keep commits reviewable and descriptive.
- PR body includes problem, solution, scope, tests, migration/deployment notes and residual risk.
- CI must pass before human merge approval.
- Agents never merge their own PRs or bypass required checks.
