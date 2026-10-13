#!/usr/bin/env bash
# Compatibility entry point for the verified P1 backup implementation.
set -Eeuo pipefail
umask 077
if [[ -n "${PG_BIN_DIR:-}" ]]; then export PATH="$PG_BIN_DIR:$PATH"; fi
if [[ -n "${PRODUCTION_BACKUP_DIR:-}" ]]; then export BACKUP_DIR="$PRODUCTION_BACKUP_DIR"; fi
exec bash "$(dirname "${BASH_SOURCE[0]}")/db-audit-backup.sh"
