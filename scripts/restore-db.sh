#!/usr/bin/env bash
# Restore the full database dump into a running Postgres container.
# Usage:
#   ./scripts/restore-db.sh              # uses defaults from .env
#   DB_PASSWORD=mypass ./scripts/restore-db.sh

set -euo pipefail

# Load .env if present
if [ -f "$(dirname "$0")/../.env" ]; then
  export $(grep -v '^#' "$(dirname "$0")/../.env" | xargs)
fi

DB_HOST="${HOST:-localhost}"
DB_PORT="${DB_PORT:-7432}"
DB_NAME="${DB_NAME:-da-ecommerce-shop}"
DB_USER="${DB_USERNAME:-postgres}"
DB_PASS="${DB_PASSWORD:-1}"
DUMP_FILE="$(dirname "$0")/../prisma/seed-dump.sql"

echo "Restoring $DUMP_FILE → $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"

PGPASSWORD="$DB_PASS" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f "$DUMP_FILE"

echo "Done."
