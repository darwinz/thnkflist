#!/usr/bin/env bash
#
# Confirm the Thnkflist schema is present in a target environment.
#
# Usage:
#   ./verify-appwrite.sh dev
#   ./verify-appwrite.sh prod
#
# Auth works the same way as setup-appwrite.sh (APPWRITE_API_KEY or existing
# `appwrite login` session). This script does NOT mutate ~/.appwrite/prefs.json.

set -euo pipefail

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
cd "$here"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

ENV="${1:-}"
case "$ENV" in
  dev)
    ENDPOINT="${THNKFLIST_DEV_ENDPOINT:-https://fra.cloud.appwrite.io/v1}"
    PROJECT="${THNKFLIST_DEV_PROJECT:-64d8612349bc9c61e154}"
    ;;
  prod)
    ENDPOINT="${THNKFLIST_PROD_ENDPOINT:-https://fra.cloud.appwrite.io/v1}"
    PROJECT="${THNKFLIST_PROD_PROJECT:-}"
    if [[ -z "$PROJECT" ]]; then
      echo "error: set THNKFLIST_PROD_PROJECT to your prod Appwrite project ID" >&2
      exit 2
    fi
    ;;
  *)
    echo "usage: $0 <dev|prod>" >&2
    exit 2
    ;;
esac

if ! command -v appwrite >/dev/null 2>&1; then
  echo "error: appwrite CLI not found. install with: npm i -g appwrite-cli" >&2
  exit 1
fi

DB="thnkflist"

if [[ -n "${APPWRITE_API_KEY:-}" ]]; then
  export APPWRITE_ENDPOINT="$ENDPOINT"
  export APPWRITE_PROJECT_ID="$PROJECT"
fi

echo "==> project: $PROJECT ($ENV @ $ENDPOINT)"
appwrite projects get --project-id "$PROJECT" >/dev/null
echo "    ok."

echo "==> database: $DB"
appwrite databases get --database-id "$DB" >/dev/null
echo "    ok."

for coll in lists items; do
  echo "==> collection: $coll"
  appwrite databases get-collection \
    --database-id "$DB" \
    --collection-id "$coll" >/dev/null
  echo "    ok."
done

echo
echo "verification passed."
