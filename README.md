# Thnkflist

> A running gratitude list — refreshed as often as you need it.

[![Live site](https://img.shields.io/badge/live-www.thnkflist.com-111111?style=flat-square)](https://www.thnkflist.com)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square)](./LICENSE.md)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Appwrite](https://img.shields.io/badge/Appwrite-Cloud-F02E65?logo=appwrite&logoColor=white&style=flat-square)](https://appwrite.io)
[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000?logo=vercel&style=flat-square)](https://vercel.com)

Thnkflist turns a daily gratitude practice into a lightweight, always-on ritual.
Spin up a new list whenever the mood strikes — before coffee, after a hike, at
the end of the day — and every past list stays one click away. Over time, a
heat map and streak counters reveal the shape of your practice.

Free to use at **[www.thnkflist.com](https://www.thnkflist.com)**.

## Highlights

- **Lists, not entries.** Each list is a first-class container with its own
  optional title, note, and mood. Make as many per day as you want.
- **History always at hand.** The current list sits front and center; past
  lists collapse into a date-grouped rail, with a mobile drawer on narrow
  viewports.
- **Insights without spreadsheets.** A GitHub-style contribution heatmap,
  current and longest streaks, totals, and a mood breakdown live at `/stats`.
- **Sign in with Google** — or with email + password if you prefer.
- **Inline everything.** Titles, items, moods, and notes all edit in place and
  persist as you work.

## Tech stack

| Layer        | Choice                                                              |
| ------------ | ------------------------------------------------------------------- |
| Frontend     | React 19, React Router 7, Tailwind CSS 3, Create React App (CRACO)  |
| Backend      | Appwrite Cloud — auth (email + Google OAuth2), databases, row-level permissions |
| Hosting      | Vercel (production + automatic preview deployments)                 |
| Tests        | Jest + React Testing Library, pure-function analytics coverage       |
| Tooling      | Appwrite CLI, shell-scripted env-aware schema pushes                 |

## Architecture

```
 ┌──────────────┐       ┌──────────────────────────┐       ┌────────────────┐
 │              │       │                          │       │                │
 │  React app   │◀─────▶│   Appwrite Cloud API     │◀─────▶│  Google OAuth  │
 │  (Vercel)    │       │  • accounts + sessions   │       │                │
 │              │       │  • lists + items (DBs)   │       │                │
 └──────────────┘       └──────────────────────────┘       └────────────────┘
```

- Two collections: `lists` (title, note, mood, userId) and `items` (content,
  position, listId, userId).
- Document-level permissions scoped to the owning user at creation time —
  the client only ever sees its own data.
- The React app is a thin client: React Router for navigation, custom hooks
  (`useList`, `useLists`, `useCurrentList`, `useStats`) for data fetching, and
  pure functions for analytics so they're trivially unit-testable.

## Getting started

### Prerequisites

- Node.js 22+
- An [Appwrite Cloud](https://cloud.appwrite.io) account (free tier is enough)
- `appwrite` CLI — `npm i -g appwrite-cli`
- `jq` — `brew install jq` (used by the schema-push script)

### Backend setup

1. Create a project in the Appwrite Cloud console.
2. In that project → **Integrations → API keys**, create a key with scopes:
   `databases.read`, `databases.write`, `collections.read`,
   `collections.write`, `attributes.read`, `attributes.write`, `indexes.read`,
   `indexes.write`.
3. Copy env templates and fill in values:
   ```bash
   cp .env.development.example .env.development
   cp .env.production.example .env.production
   ```
   Set `REACT_APP_PROJECT` in `.env.development` to your dev project ID.
4. Drop your API key into `.env.local` (gitignored):
   ```
   APPWRITE_API_KEY=<your api key>
   ```
5. Push the schema:
   ```bash
   ./setup-appwrite.sh dev
   ./verify-appwrite.sh dev
   ```

### Run it

```bash
npm install
npm start
```

Open http://localhost:3000.

### Optional: enable Google sign-in

1. Create an OAuth 2.0 client in Google Cloud Console (type: Web application).
2. Add this **Authorized redirect URI**:
   ```
   https://<region>.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/<project-id>
   ```
3. In the Appwrite Console → Auth → Google → enable and paste the Client ID +
   Secret.

## Testing

```bash
npm test                                # watch mode
CI=true npm test -- --watchAll=false    # single run
```

Analytics functions (`src/pages/Stats/compute.js`) cover: empty data,
single-day streaks, broken streaks, same-day deduplication, cross-boundary
heatmap bins, mood aggregation with tie-breaking.

## Deployment

Production ships to Vercel from `main`. Environment variables live in Vercel's
project settings (Production scope); they mirror the shape of
`.env.production.example`. Schema changes go out via:

```bash
./setup-appwrite.sh prod
```

A separate Appwrite project isolates prod data from dev. The push scripts take
`dev|prod` and load the matching `.env.<env>` file for endpoint + project ID,
with an optional `APPWRITE_API_KEY` overriding any existing `appwrite login`
session.

## Project structure

```
src/
├── api/            # Appwrite SDK wrapper (domain-named methods)
├── hooks/          # useUser, useList, useLists, useCurrentList, useStats
├── pages/
│   ├── Landing/    # public landing page
│   ├── Login/      # email + Google sign-in
│   ├── List/       # main view: current list + history rail
│   └── Stats/      # heatmap, streaks, totals, moods (+ pure compute.js)
├── utils/config.js # env-driven config surface
└── App.js          # routes + auth gating
```

## Contributing

Issues and pull requests are welcome. For anything non-trivial, open an issue
first so we can align on direction before you write code.

## License

[Apache 2.0](./LICENSE.md) — use it, fork it, learn from it.

## Author

Built by [Brandon Johnson](https://johnsonbrandon.com) as a personal portfolio
project.
