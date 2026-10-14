#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
exec node "$(dirname "${BASH_SOURCE[0]}")/db-audit-backup.cjs"
