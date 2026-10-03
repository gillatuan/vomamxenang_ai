# Architect — TASK-0008

External model execution is treated as untrusted computation.

`execution packet → runtime request → provider envelope → provider → untrusted JSON → validator/policy → advisory result`

The model never receives GitHub tokens, production credentials, environment variables, or unrestricted filesystem access. Phase 5.4 accepts only a JSON object with summary, proposedActions and artifacts. Every proposed action is checked against both capabilities and the packet forbidden-action list.

No accepted result is automatically applied. Repository mutation will require a separate mutation gateway in a later phase.
