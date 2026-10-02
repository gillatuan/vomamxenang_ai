# Transition Contract

| From | To | Owner |
|---|---|---|
| requirement | planning | Planner |
| planning | architecture | Architect |
| architecture | development | Developer |
| development | review | Reviewer |
| review | qa | QA |
| review | development | Developer |
| qa | release_ready | DevOps |
| qa | development | Developer |
| release_ready | human_approval | Human |
| release_ready | development | Developer |
| human_approval | done | Human |

Security/payment/inventory/pricing risk cannot skip Reviewer or QA. Destructive DB and production actions require explicit human approval.
