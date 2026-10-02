# Backend Rules
- DTO/pipe boundaries validate transport input; services own business rules.
- Authorization must be explicit for protected/admin behavior.
- Prefer typed DTOs and predictable errors; keep module ownership clear.
- Financial, inventory, pricing, auth and payment paths require failure-path tests.
- Use structured logging without sensitive payloads.
