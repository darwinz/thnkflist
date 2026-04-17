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

ENV="${1:-}"
case "$ENV" in
  dev|prod) ;;
  *) echo "usage: $0 <dev|prod>" >&2; exit 2 ;;
esac

ENV_FILE=".env.$ENV"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: $ENV_FILE not found." >&2
  echo "       copy it from $ENV_FILE.example and fill in real values." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090,SC1091
[[ -f .env.local ]] && source .env.local
# shellcheck disable=SC1090,SC1091
source "$ENV_FILE"
set +a

UP_ENV="$(echo "$ENV" | tr '[:lower:]' '[:upper:]')"
ENDPOINT_VAR="THNKFLIST_${UP_ENV}_ENDPOINT"
PROJECT_VAR="THNKFLIST_${UP_ENV}_PROJECT"
ENDPOINT="${!ENDPOINT_VAR:-${REACT_APP_ENDPOINT:-}}"
PROJECT="${!PROJECT_VAR:-${REACT_APP_PROJECT:-}}"

if [[ -z "$ENDPOINT" || -z "$PROJECT" ]]; then
  echo "error: couldn't resolve endpoint + project for '$ENV'." >&2
  echo "       check that $ENV_FILE has REACT_APP_ENDPOINT and REACT_APP_PROJECT set." >&2
  exit 1
fi

if ! command -v appwrite >/dev/null 2>&1; then
  echo "error: appwrite CLI not found. install with: npm i -g appwrite-cli" >&2
  exit 1
fi

DB="thnkflist"

# If an API key is available, isolate the CLI in a scratch HOME with the right
# endpoint/project/key so we don't depend on whatever session ~/.appwrite has.
if [[ -n "${APPWRITE_API_KEY:-}" ]]; then
  APPWRITE_SANDBOX="$(mktemp -d)"
  trap 'rm -rf "$APPWRITE_SANDBOX"' EXIT
  export HOME="$APPWRITE_SANDBOX"
  appwrite client \
    --endpoint "$ENDPOINT" \
    --project-id "$PROJECT" \
    --key "$APPWRITE_API_KEY" >/dev/null
fi

echo "==> target: $PROJECT ($ENV @ $ENDPOINT)"

# NOTE: `appwrite projects get` is a console endpoint — API keys can't hit it.
# We confirm the project indirectly by successfully reading one of its
# databases, which is in an API key's reachable scope.

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
