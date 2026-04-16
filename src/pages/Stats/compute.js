// Pure analytics helpers. No React, no fetch, no dates-from-clock —
// only the input data is used so these are easy to unit test.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Convert an ISO timestamp to a local-time YYYY-MM-DD key.
export function dayKey(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toLocalMidnight(iso) {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * computeStreak(items, { today? })
 * Counts consecutive local-calendar days (back from `today`) that contain
 * at least one item. Also returns the longest run ever observed in the data.
 *
 * `today` defaults to the current clock date, but tests pass it in.
 */
export function computeStreak(items, { today = new Date() } = {}) {
  if (!items || items.length === 0) return { current: 0, longest: 0 };

  const days = new Set(items.map((i) => dayKey(i.$createdAt)));
  const sorted = [...days].sort();

  // longest
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const key of sorted) {
    const ms = toLocalMidnight(key + "T00:00:00");
    if (prev !== null && ms - prev === MS_PER_DAY) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = ms;
  }

  // current (walk back from today)
  let current = 0;
  const cursor = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  while (days.has(dayKey(cursor.toISOString()))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, longest };
}

/**
 * computeHeatmap(items, { weeks = 53, today? })
 * Returns a flat list of { date: "YYYY-MM-DD", count } cells, oldest first,
 * ending at `today`. Each entry is always present (count 0 for empty days).
 */
export function computeHeatmap(items, { weeks = 53, today = new Date() } = {}) {
  const counts = new Map();
  for (const i of items ?? []) {
    const k = dayKey(i.$createdAt);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const cells = [];
  const end = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const totalDays = weeks * 7;
  const start = new Date(end);
  start.setDate(start.getDate() - (totalDays - 1));

  const cursor = new Date(start);
  for (let n = 0; n < totalDays; n++) {
    const k = dayKey(cursor.toISOString());
    cells.push({ date: k, count: counts.get(k) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

export function computeTotals(lists, items) {
  const totalLists = lists?.length ?? 0;
  const totalItems = items?.length ?? 0;
  const avgItemsPerList =
    totalLists === 0 ? 0 : Math.round((totalItems / totalLists) * 10) / 10;

  const days = new Set((items ?? []).map((i) => dayKey(i.$createdAt)));
  const daysActive = days.size;

  return { totalLists, totalItems, avgItemsPerList, daysActive };
}

export function computeMoodDistribution(lists) {
  const counts = new Map();
  for (const l of lists ?? []) {
    if (!l.mood) continue;
    const k = l.mood.toLowerCase().trim();
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count || a.mood.localeCompare(b.mood));
}
