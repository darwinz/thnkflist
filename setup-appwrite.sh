#!/usr/bin/env bash
#
# Thnkflist Appwrite setup.
#
# Pushes the schema defined in appwrite.json (project, database, collections,
# attributes, indexes) to the linked Appwrite instance. Safe to re-run: the CLI
# performs a diff and only applies changes.
#
# Prereqs:
#   - Appwrite CLI 6.x+ installed  (npm i -g appwrite-cli)
#   - Logged in                     (appwrite login)
#   - Project linked                (appwrite init project  OR  cwd contains appwrite.json)

set -euo pipefail

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
cd "$here"

if ! command -v appwrite >/dev/null 2>&1; then
  echo "error: appwrite CLI not found. install with: npm i -g appwrite-cli" >&2
  exit 1
fi

if [[ ! -f appwrite.json ]]; then
  echo "error: appwrite.json not found in $here" >&2
  exit 1
fi

echo "==> pushing collections (and their attributes + indexes)..."
appwrite push collection --all --force

echo
echo "==> schema push complete."
echo
cat <<'OAUTH'
-------------------------------------------------------------------------------
 Google OAuth2 — manual setup (not in appwrite.json)
-------------------------------------------------------------------------------
 1. Google Cloud Console → APIs & Services → Credentials
    • Create an OAuth 2.0 Client ID (type: Web application).
    • Authorized redirect URI:
        {APPWRITE_ENDPOINT}/account/sessions/oauth2/callback/google/{PROJECT_ID}
      For local dev with this repo's .env:
        http://localhost/v1/account/sessions/oauth2/callback/google/67f8c1a49d30432fc2c9

 2. Appwrite Console → Auth → Settings → Google
    • Toggle "Enabled" on.
    • Paste the Client ID and Client Secret from step 1.
    • Save.

 3. In the React app, make sure these are set in .env:
      REACT_APP_OAUTH_SUCCESS_URL=http://localhost:3000/lists
      REACT_APP_OAUTH_FAILURE_URL=http://localhost:3000/login?error=oauth_failed
-------------------------------------------------------------------------------
OAUTH

echo "done."
