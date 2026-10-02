# Release Workflow
Require green CI and resolved blocking review/QA findings. DevOps verifies environment dependencies, migration ordering, deployment target, smoke checks, observability and rollback. Human approves merge and production actions. After release run bounded smoke checks; rollback/escalate critical failures rather than applying unreviewed production patches.
