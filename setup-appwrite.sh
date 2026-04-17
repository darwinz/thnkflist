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

# Source .env.local first (secrets / personal overrides), then the env-specific
# file. Values in .env.<env> take precedence over .env.local. This makes the
# committed .env.<env> the source of truth for project ID + endpoint — no
# duplication into the shell.
set -a
# shellcheck disable=SC1090,SC1091
[[ -f .env.local ]] && source .env.local
# shellcheck disable=SC1090,SC1091
source "$ENV_FILE"
set +a

# Allow THNKFLIST_{DEV,PROD}_{PROJECT,ENDPOINT} to override the .env.<env>
# values when you need to temporarily target a different project (rare).
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
  # API-key path. The CLI reads endpoint/project/cookie from
  # ~/.appwrite/prefs.json, so setting APPWRITE_ENDPOINT as an env var isn't
  # enough — it will silently use whatever endpoint is in the active session
  # (e.g. fra from a previous dev login), which fails against an sfo project.
  #
  # Isolate the CLI by pointing HOME at a scratch dir, then populate the CLI
  # config with the correct endpoint + project + key for this push. The real
  # ~/.appwrite/prefs.json is never touched.
  APPWRITE_SANDBOX="$(mktemp -d)"
  trap 'mv "$backup" appwrite.json; rm -rf "$APPWRITE_SANDBOX"' EXIT
  export HOME="$APPWRITE_SANDBOX"
  appwrite client \
    --endpoint "$ENDPOINT" \
    --project-id "$PROJECT" \
    --key "$APPWRITE_API_KEY" >/dev/null
else
  # Session path: rely on existing `appwrite login`. Verify it first so we
  # fail with a readable error instead of "session not found" mid-push. Also
  # confirm the session's endpoint matches what we expect for this env — a
  # session logged in against fra can't push to an sfo project.
  if ! appwrite account get >/dev/null 2>&1; then
    cat >&2 <<'EOF'
error: no working Appwrite CLI session found.

Either:
  (a) run `appwrite login` first against the right region, or
  (b) create an API key in the Appwrite Cloud console (Project → Integrations
      → API keys) and export it:

        export APPWRITE_API_KEY=<your-api-key>
        ./setup-appwrite.sh prod

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
