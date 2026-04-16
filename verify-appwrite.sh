#!/usr/bin/env bash
#
# Thnkflist Appwrite verify — confirm the schema is in place and collections
# match what the app expects. Exits non-zero if anything is missing.

set -euo pipefail

PROJECT_ID="67f8c1a49d30432fc2c9"
DATABASE_ID="67f8c746002b058ce729"
EXPECTED_COLLECTIONS=("lists" "items")

if ! command -v appwrite >/dev/null 2>&1; then
  echo "error: appwrite CLI not found. install with: npm i -g appwrite-cli" >&2
  exit 1
fi

echo "==> project: $PROJECT_ID"
appwrite projects get --project-id "$PROJECT_ID" >/dev/null
echo "    ok."

echo "==> database: $DATABASE_ID"
appwrite databases get --database-id "$DATABASE_ID" >/dev/null
echo "    ok."

for coll in "${EXPECTED_COLLECTIONS[@]}"; do
  echo "==> collection: $coll"
  appwrite databases get-collection \
    --database-id "$DATABASE_ID" \
    --collection-id "$coll" >/dev/null
  echo "    ok."
done

echo
echo "verification passed."
