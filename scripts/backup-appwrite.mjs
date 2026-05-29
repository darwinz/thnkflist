#!/usr/bin/env node
/**
 * Snapshot a prod Appwrite project to local JSON files.
 *
 * Reads endpoint + project + collection IDs from .env.prod and the admin
 * API key from .env.local. Talks directly to Appwrite's REST API so this
 * script doesn't need any new dependency on top of the existing Node 22
 * runtime.
 *
 * Output: ./backups/appwrite/<ISO-timestamp>/{users,lists,items,manifest}.json
 *
 * Usage:
 *   node scripts/backup-appwrite.js
 *
 * Read-only. Never writes back to Appwrite. Safe to re-run.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

// ── Hand-parse .env files so we don't add a dotenv dependency ────────────
async function loadEnvFile(path) {
  if (!existsSync(path)) {
    throw new Error(`missing env file: ${path}`);
  }
  const text = await readFile(path, "utf8");
  const out = {};
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // strip matching surrounding quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function requireKey(obj, key, hint) {
  const v = obj[key];
  if (!v) throw new Error(`${key} is not set${hint ? ` (${hint})` : ""}`);
  return v;
}

// ── Appwrite REST helpers ────────────────────────────────────────────────
const qJson = (method, values) =>
  JSON.stringify({ method, values });

async function awGet({ endpoint, project, apiKey }, path, queries = []) {
  const url = new URL(endpoint + path);
  for (const q of queries) {
    url.searchParams.append("queries[]", q);
  }
  const res = await fetch(url, {
    headers: {
      "X-Appwrite-Project": project,
      "X-Appwrite-Key": apiKey,
      "X-Appwrite-Response-Format": "1.6.0",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`appwrite ${res.status} ${path}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function paginate(awCtx, path, key, queries = []) {
  const out = [];
  let cursor = null;
  while (true) {
    const pageQueries = [...queries, qJson("limit", [100])];
    if (cursor) pageQueries.push(qJson("cursorAfter", [cursor]));
    const page = await awGet(awCtx, path, pageQueries);
    const rows = page[key] ?? [];
    out.push(...rows);
    if (rows.length < 100) break;
    cursor = rows[rows.length - 1].$id;
  }
  return out;
}

// ── main ─────────────────────────────────────────────────────────────────
async function main() {
  const prodEnv = await loadEnvFile(join(ROOT, ".env.prod"));
  const localEnv = await loadEnvFile(join(ROOT, ".env.local"));

  const ctx = {
    endpoint: requireKey(prodEnv, "REACT_APP_ENDPOINT", ".env.prod"),
    project: requireKey(prodEnv, "REACT_APP_PROJECT", ".env.prod"),
    apiKey: requireKey(localEnv, "APPWRITE_API_KEY", ".env.local"),
  };
  const databaseId = requireKey(prodEnv, "REACT_APP_DATABASE_ID", ".env.prod");
  const listsCol = requireKey(prodEnv, "REACT_APP_LISTS_COLLECTION_ID", ".env.prod");
  const itemsCol = requireKey(prodEnv, "REACT_APP_ITEMS_COLLECTION_ID", ".env.prod");

  // Quick sanity: fail fast if the API key is wrong before we burn time.
  const ping = await fetch(`${ctx.endpoint}/users?queries[]=${encodeURIComponent(qJson("limit", [1]))}`, {
    headers: {
      "X-Appwrite-Project": ctx.project,
      "X-Appwrite-Key": ctx.apiKey,
    },
  });
  if (!ping.ok) {
    throw new Error(
      `appwrite ping failed (status ${ping.status}). check APPWRITE_API_KEY in .env.local and that it has users.read + databases.read scope.`,
    );
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = join(ROOT, "backups", "appwrite", stamp);
  await mkdir(outDir, { recursive: true });

  process.stdout.write(`==> source : ${ctx.endpoint} (project ${ctx.project})\n`);
  process.stdout.write(`==> output : ${outDir}\n\n`);

  process.stdout.write("fetching users... ");
  const users = await paginate(ctx, "/users", "users");
  process.stdout.write(`${users.length}\n`);

  process.stdout.write("fetching lists... ");
  const lists = await paginate(
    ctx,
    `/databases/${databaseId}/collections/${listsCol}/documents`,
    "documents",
  );
  process.stdout.write(`${lists.length}\n`);

  process.stdout.write("fetching items... ");
  const items = await paginate(
    ctx,
    `/databases/${databaseId}/collections/${itemsCol}/documents`,
    "documents",
  );
  process.stdout.write(`${items.length}\n`);

  await writeFile(join(outDir, "users.json"), JSON.stringify(users, null, 2));
  await writeFile(join(outDir, "lists.json"), JSON.stringify(lists, null, 2));
  await writeFile(join(outDir, "items.json"), JSON.stringify(items, null, 2));

  const manifest = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    source: {
      endpoint: ctx.endpoint,
      project: ctx.project,
      databaseId,
      listsCollectionId: listsCol,
      itemsCollectionId: itemsCol,
    },
    counts: { users: users.length, lists: lists.length, items: items.length },
    notes:
      "raw appwrite response shapes preserved verbatim. seed-supabase reads this dir as input.",
  };
  await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  // Distinct-user sanity: how many user IDs do the rows reference?
  const userIdSet = new Set([
    ...lists.map((l) => l.userId),
    ...items.map((i) => i.userId),
  ]);

  process.stdout.write("\n==> done.\n");
  process.stdout.write(`    users.json  ${users.length}\n`);
  process.stdout.write(`    lists.json  ${lists.length}\n`);
  process.stdout.write(`    items.json  ${items.length}\n`);
  process.stdout.write(
    `    distinct user ids referenced by lists/items: ${userIdSet.size}\n`,
  );
  if (userIdSet.size > users.length) {
    process.stdout.write(
      "    WARN: more distinct user ids in lists/items than in users.json — likely deleted accounts left orphaned rows.\n",
    );
  }
}

main().catch((err) => {
  process.stderr.write(`\n[backup-appwrite] ${err.message}\n`);
  process.exit(1);
});
