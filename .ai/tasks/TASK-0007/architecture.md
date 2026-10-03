# Architect — TASK-0007

The runtime adapter is downstream of the trusted deterministic packet builder:

`validated state → route → execution packet → runtime adapter → result`

The adapter receives capabilities; it does not invent them. Repository context is loaded only from paths declared by the packet and only when the resolved path remains inside the repository root.

Phase 5.3 ships a `local` adapter that renders the exact execution request without invoking a model. An `external` provider is deliberately unsupported in this task. This proves the runtime interface in CI before credentials or network permissions are introduced.

Privileged operations remain impossible at this layer.
