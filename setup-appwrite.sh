#!/usr/bin/env bash
#
# Push the Thnkflist Appwrite schema to a target environment.
#
# Usage:
#   ./setup-appwrite.sh dev
#   ./setup-appwrite.sh prod
#
# Auth, in priority order:
#   1. APPWRITE_API_KEY env var — recommended for scripted pushes.
#      Create one in the Appwrite Console: Project → Integrations → API keys.
#      Required scopes: databases.read/write, collections.read/write,
#      attributes.read/write, indexes.read/write.
#      You can put APPWRITE_API_KEY (and the _PROJECT/_ENDPOINT overrides)
#      in .env.local — the script sources it automatically if present.
#   2. Existing `appwrite login` console session (whatever `appwrite client`
#      is currently pointed at). The script does NOT reconfigure the CLI in
#      this mode — it just runs `appwrite push all --force`. Make sure
#      `appwrite account get` works before running this.
#
# The script swaps appwrite.json's projectId in place while the push runs,
# then restores it — so the committed file always targets dev.

set -euo pipefail

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
cd "$here"

# Load .env.local if it exists so APPWRITE_API_KEY / overrides just work.
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
if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq not found. install with: brew install jq" >&2
  exit 1
fi
if [[ ! -f appwrite.json ]]; then
  echo "error: appwrite.json not found in $here" >&2
  exit 1
fi

echo "==> target: $ENV"
echo "    endpoint: $ENDPOINT"
echo "    project : $PROJECT"
if [[ -n "${APPWRITE_API_KEY:-}" ]]; then
  echo "    auth    : API key (APPWRITE_API_KEY)"
else
  echo "    auth    : console session (existing appwrite login)"
fi
echo

# Snapshot appwrite.json so we can restore it if anything fails.
backup="$(mktemp)"
cp appwrite.json "$backup"
trap 'mv "$backup" appwrite.json' EXIT

# Swap projectId for this push.
tmp="$(mktemp)"
jq --arg pid "$PROJECT" '.projectId = $pid' appwrite.json > "$tmp"
mv "$tmp" appwrite.json

if [[ -n "${APPWRITE_API_KEY:-}" ]]; then
  # API-key path: pass credentials via env so we don't mutate ~/.appwrite/prefs.json.
  export APPWRITE_ENDPOINT="$ENDPOINT"
  export APPWRITE_PROJECT_ID="$PROJECT"
else
  # Session path: rely on existing `appwrite login`. Verify it first so we
  # fail with a readable error instead of "session not found" mid-push.
  if ! appwrite account get >/dev/null 2>&1; then
    cat >&2 <<'EOF'
error: no working Appwrite CLI session found.

Either:
  (a) run `appwrite login` first (against https://fra.cloud.appwrite.io/v1), or
  (b) create an API key in the Appwrite Cloud console (Project → Integrations
      → API keys) and export it:

        export APPWRITE_API_KEY=<your-api-key>
        ./setup-appwrite.sh dev

      (or drop APPWRITE_API_KEY=... into .env.local)
EOF
    exit 1
  fi
fi

# 1. Ensure the database exists. `push all` in some CLI versions doesn't
#    create databases — being explicit is safer.
DB_ID="$(jq -r '.databases[0]."$id"'   appwrite.json)"
DB_NAME="$(jq -r '.databases[0].name' appwrite.json)"
if appwrite databases get --database-id "$DB_ID" >/dev/null 2>&1; then
  echo "==> database '$DB_ID' already exists."
else
  echo "==> creating database '$DB_ID'..."
  appwrite databases create \
    --database-id "$DB_ID" \
    --name "$DB_NAME" \
    --enabled true
fi

# 2. Push collections (+ their attributes and indexes).
echo "==> pushing collections..."
appwrite push collection --all --force

echo
cat <<OAUTH
-------------------------------------------------------------------------------
 Google OAuth2 — one-time manual setup per Appwrite project
-------------------------------------------------------------------------------
 1. Google Cloud Console → APIs & Services → Credentials
    • Create an OAuth 2.0 Client ID (type: Web application).
    • Authorized redirect URI:
        ${ENDPOINT}/account/sessions/oauth2/callback/google/${PROJECT}

 2. Appwrite Console → this project → Auth → Settings → Google
    • Enable the provider.
    • Paste the Client ID + Client Secret from step 1.

 3. For '$ENV', the React app reads OAuth URLs from .env.$ENV — make sure:
      REACT_APP_OAUTH_SUCCESS_URL points at <your-$ENV-origin>/lists
      REACT_APP_OAUTH_FAILURE_URL points at <your-$ENV-origin>/login?error=oauth_failed
    For prod, update .env.production to your real deployed origin.
-------------------------------------------------------------------------------
OAUTH

echo "done."
