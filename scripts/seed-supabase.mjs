#!/usr/bin/env node
/**
 * Seed a Supabase database from an Appwrite backup directory.
 *
 * Reads ./backups/appwrite/<dir>/{users,lists,items}.json (defaults to the
 * newest dir) and writes the data into a Supabase project — local stack
 * by default, prod when --target=prod.
 *
 * Idempotent: re-running uses legacy_user_map (for users) and
 * legacy_appwrite_id (for lists / items) as natural keys, skipping any row
 * that already landed.
 *
 * Users are imported as "synthetic" auth.users rows: same UUID, throw-away
 * email (`legacy-<id>@migrated.thnkflist.local`), randomized password. The
 * REAL email goes into legacy_user_map. When the real user later signs in
 * (Google OAuth or password reset) the claim_legacy_data trigger on
 * auth.users repoints lists/items from the synthetic user to the real
 * auth.uid().
 *
 * Usage:
 *   node scripts/seed-supabase.mjs               # local, latest backup
 *   node scripts/seed-supabase.mjs --target=local --backup=backups/appwrite/<dir>
 *   node scripts/seed-supabase.mjs --target=prod --dry-run
 *
 * For --target=prod, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the
 * shell (or via op://) before running. Never commit those.
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

// ── args ──────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((arg) => {
    if (!arg.startsWith("--")) return [];
    const [k, v] = arg.slice(2).split("=");
    return [[k, v ?? true]];
  }),
);

const target = (args.target || "local").toLowerCase();
const dryRun = !!args["dry-run"];
let backupArg = args.backup;

if (!["local", "prod"].includes(target)) {
  fail(`--target must be "local" or "prod" (got "${target}")`);
}

function fail(msg) {
  process.stderr.write(`[seed-supabase] ${msg}\n`);
  process.exit(1);
}

// ── pick backup directory ────────────────────────────────────────────
const backupsRoot = join(ROOT, "backups", "appwrite");
if (!backupArg) {
  if (!existsSync(backupsRoot)) {
    fail(`no backups dir at ${backupsRoot}. run scripts/backup-appwrite.mjs first.`);
  }
  const dirs = (await readdir(backupsRoot)).filter((d) => !d.startsWith("."));
  if (dirs.length === 0) fail("no backup directories found.");
  dirs.sort(); // ISO timestamps sort lexicographically
  backupArg = join(backupsRoot, dirs[dirs.length - 1]);
} else {
  backupArg = resolve(ROOT, backupArg);
}

if (!existsSync(join(backupArg, "manifest.json"))) {
  fail(`no manifest.json in ${backupArg}. is this a real backup dir?`);
}

// ── pick Supabase target ─────────────────────────────────────────────
// Both targets require SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to be set
// in the shell. For local we used to default them to the well-known
// `supabase start` outputs, but baking the local secret-key string
// (sb_secret_*) into source tripped GitHub's push protection — its scanner
// can't tell a local dev key from a production one. Easiest fix: always
// require the env vars, even for local.
//
// For local, grab the values from `supabase status` (or the one-time
// output of `supabase start`):
//
//   SUPABASE_URL=http://127.0.0.1:54321 \
//   SUPABASE_SERVICE_ROLE_KEY="$(supabase status --output json | jq -r .SERVICE_ROLE_KEY)" \
//   node scripts/seed-supabase.mjs --target=local
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  fail(
    `set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the shell before running (target=${target}).`,
  );
}

const sb = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── load backup ──────────────────────────────────────────────────────
const manifest = JSON.parse(await readFile(join(backupArg, "manifest.json"), "utf8"));
const users = JSON.parse(await readFile(join(backupArg, "users.json"), "utf8"));
const lists = JSON.parse(await readFile(join(backupArg, "lists.json"), "utf8"));
const items = JSON.parse(await readFile(join(backupArg, "items.json"), "utf8"));

process.stdout.write(`==> source backup : ${backupArg}\n`);
process.stdout.write(`    captured at   : ${manifest.capturedAt}\n`);
process.stdout.write(`    counts        : ${users.length} users, ${lists.length} lists, ${items.length} items\n`);
process.stdout.write(`==> target        : ${target} (${supabaseUrl})\n`);
process.stdout.write(`==> mode          : ${dryRun ? "DRY RUN (no writes)" : "writing"}\n\n`);

const counts = {
  usersCreated: 0,
  usersSkipped: 0,
  listsCreated: 0,
  listsSkipped: 0,
  itemsCreated: 0,
  itemsSkipped: 0,
};

// ── 1. Users → synthetic auth.users + legacy_user_map ────────────────
process.stdout.write("seeding users...\n");
const synthByLegacy = new Map(); // legacyId → synthetic uuid

for (const u of users) {
  // Has this legacy user already been mapped? Re-use the existing mapping.
  const { data: existing, error: lookupErr } = await sb
    .from("legacy_user_map")
    .select("synthetic_id")
    .eq("legacy_id", u.$id)
    .maybeSingle();
  if (lookupErr) fail(`legacy_user_map lookup failed for ${u.$id}: ${lookupErr.message}`);

  if (existing) {
    synthByLegacy.set(u.$id, existing.synthetic_id);
    counts.usersSkipped += 1;
    process.stdout.write(`  · ${u.email}: already mapped → ${existing.synthetic_id}\n`);
    continue;
  }

  const syntheticId = randomUUID();
  const syntheticEmail = `legacy-${u.$id}@migrated.thnkflist.local`;
  const realEmail = (u.email || "").trim();

  if (!realEmail) {
    process.stdout.write(`  ! skipping user ${u.$id}: no email (would never be claimable)\n`);
    counts.usersSkipped += 1;
    continue;
  }

  if (dryRun) {
    process.stdout.write(`  + would create user ${realEmail} (synth ${syntheticId})\n`);
    synthByLegacy.set(u.$id, syntheticId);
    counts.usersCreated += 1;
    continue;
  }

  // Create the synthetic auth.users row. We pre-pick the UUID so the FK in
  // lists/items can target it deterministically. The synthetic email keeps
  // the auth.users unique-email constraint clear for when the real user
  // eventually signs in with their real email.
  const { error: createErr } = await sb.auth.admin.createUser({
    id: syntheticId,
    email: syntheticEmail,
    password: randomBytes(32).toString("base64"),
    email_confirm: true,
    user_metadata: {
      name: u.name || null,
      legacy_appwrite_id: u.$id,
      original_email: realEmail,
      migrated_at: new Date().toISOString(),
    },
  });
  if (createErr) {
    fail(`auth.admin.createUser failed for ${realEmail}: ${createErr.message}`);
  }

  // Record the mapping so the trigger can re-link later.
  const { error: mapErr } = await sb.from("legacy_user_map").insert({
    legacy_id: u.$id,
    synthetic_id: syntheticId,
    email: realEmail,
  });
  if (mapErr) fail(`legacy_user_map insert failed for ${u.$id}: ${mapErr.message}`);

  synthByLegacy.set(u.$id, syntheticId);
  counts.usersCreated += 1;
  process.stdout.write(`  + ${realEmail} → ${syntheticId}\n`);
}

// ── 2. Lists ────────────────────────────────────────────────────────
process.stdout.write("\nseeding lists...\n");
const listIdByLegacy = new Map(); // legacy list $id → new uuid

// Pull existing rows once so we can skip them without doing N round trips.
const { data: existingLists, error: existingListsErr } = await sb
  .from("lists")
  .select("id, legacy_appwrite_id")
  .not("legacy_appwrite_id", "is", null);
if (existingListsErr) fail(`lists prefetch failed: ${existingListsErr.message}`);
for (const row of existingLists ?? []) {
  listIdByLegacy.set(row.legacy_appwrite_id, row.id);
}

for (const l of lists) {
  if (listIdByLegacy.has(l.$id)) {
    counts.listsSkipped += 1;
    continue;
  }
  const userId = synthByLegacy.get(l.userId);
  if (!userId) {
    process.stdout.write(`  ! orphan list ${l.$id}: no synthetic user for ${l.userId}, skipping.\n`);
    counts.listsSkipped += 1;
    continue;
  }
  const newId = randomUUID();
  if (dryRun) {
    process.stdout.write(`  + would insert list "${l.title || "(untitled)"}" → ${newId}\n`);
    listIdByLegacy.set(l.$id, newId);
    counts.listsCreated += 1;
    continue;
  }
  const { error } = await sb.from("lists").insert({
    id: newId,
    user_id: userId,
    title: l.title,
    note: l.note,
    mood: l.mood,
    legacy_appwrite_id: l.$id,
    created_at: l.$createdAt,
    updated_at: l.$updatedAt,
  });
  if (error) fail(`list insert failed for ${l.$id}: ${error.message}`);
  listIdByLegacy.set(l.$id, newId);
  counts.listsCreated += 1;
}

// ── 3. Items ────────────────────────────────────────────────────────
process.stdout.write("\nseeding items...\n");
const { data: existingItems, error: existingItemsErr } = await sb
  .from("items")
  .select("legacy_appwrite_id")
  .not("legacy_appwrite_id", "is", null);
if (existingItemsErr) fail(`items prefetch failed: ${existingItemsErr.message}`);
const existingItemSet = new Set((existingItems ?? []).map((r) => r.legacy_appwrite_id));

let itemBatch = [];
const flush = async () => {
  if (itemBatch.length === 0) return;
  if (!dryRun) {
    const { error } = await sb.from("items").insert(itemBatch);
    if (error) fail(`item batch insert failed: ${error.message}`);
  }
  counts.itemsCreated += itemBatch.length;
  itemBatch = [];
};

for (const it of items) {
  if (existingItemSet.has(it.$id)) {
    counts.itemsSkipped += 1;
    continue;
  }
  const listId = listIdByLegacy.get(it.listId);
  const userId = synthByLegacy.get(it.userId);
  if (!listId || !userId) {
    process.stdout.write(
      `  ! orphan item ${it.$id}: list ${it.listId} → ${listId}, user ${it.userId} → ${userId}\n`,
    );
    counts.itemsSkipped += 1;
    continue;
  }
  itemBatch.push({
    id: randomUUID(),
    list_id: listId,
    user_id: userId,
    content: it.content,
    position: it.position,
    legacy_appwrite_id: it.$id,
    created_at: it.$createdAt,
    updated_at: it.$updatedAt,
  });
  if (itemBatch.length >= 100) await flush();
}
await flush();

// ── summary ─────────────────────────────────────────────────────────
process.stdout.write("\n==> done.\n");
process.stdout.write(`    users    : ${counts.usersCreated} created, ${counts.usersSkipped} skipped\n`);
process.stdout.write(`    lists    : ${counts.listsCreated} created, ${counts.listsSkipped} skipped\n`);
process.stdout.write(`    items    : ${counts.itemsCreated} created, ${counts.itemsSkipped} skipped\n`);
if (dryRun) process.stdout.write("    (DRY RUN — nothing was written)\n");
