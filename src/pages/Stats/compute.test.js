import {
  computeHeatmap,
  computeMoodDistribution,
  computeStreak,
  computeTotals,
  dayKey,
} from "./compute";

// Helper: fabricate an item whose $createdAt falls on a specific local day.
// Uses noon local so DST shifts never roll it to the neighbor day.
function itemOn(year, month1, day) {
  const d = new Date(year, month1 - 1, day, 12, 0, 0);
  return { $createdAt: d.toISOString() };
}

describe("dayKey", () => {
  test("formats as YYYY-MM-DD", () => {
    expect(dayKey(new Date(2024, 0, 5, 12).toISOString())).toBe("2024-01-05");
  });
});

describe("computeStreak", () => {
  test("empty data → zero", () => {
    expect(computeStreak([])).toEqual({ current: 0, longest: 0 });
  });

  test("single day today → 1 / 1", () => {
    const today = new Date(2026, 3, 16, 12);
    const items = [itemOn(2026, 4, 16)];
    expect(computeStreak(items, { today })).toEqual({ current: 1, longest: 1 });
  });

  test("three consecutive days ending today → 3 / 3", () => {
    const today = new Date(2026, 3, 16, 12);
    const items = [
      itemOn(2026, 4, 14),
      itemOn(2026, 4, 15),
      itemOn(2026, 4, 16),
    ];
    expect(computeStreak(items, { today })).toEqual({ current: 3, longest: 3 });
  });

  test("broken streak → current 0, longest reflects best run", () => {
    const today = new Date(2026, 3, 16, 12);
    const items = [
      itemOn(2026, 4, 1),
      itemOn(2026, 4, 2),
      itemOn(2026, 4, 3),
      itemOn(2026, 4, 5), // gap on the 4th
    ];
    expect(computeStreak(items, { today })).toEqual({ current: 0, longest: 3 });
  });

  test("active streak not ending today is not counted as current", () => {
    const today = new Date(2026, 3, 16, 12);
    const items = [itemOn(2026, 4, 14), itemOn(2026, 4, 15)];
    expect(computeStreak(items, { today })).toEqual({ current: 0, longest: 2 });
  });

  test("multiple items on same day count as one day", () => {
    const today = new Date(2026, 3, 16, 12);
    const items = [
      itemOn(2026, 4, 15),
      itemOn(2026, 4, 15),
      itemOn(2026, 4, 16),
      itemOn(2026, 4, 16),
    ];
    expect(computeStreak(items, { today })).toEqual({ current: 2, longest: 2 });
  });
});

describe("computeHeatmap", () => {
  test("empty data → grid of zero cells sized to weeks*7", () => {
    const today = new Date(2026, 3, 16, 12);
    const cells = computeHeatmap([], { weeks: 2, today });
    expect(cells).toHaveLength(14);
    expect(cells.every((c) => c.count === 0)).toBe(true);
    expect(cells[cells.length - 1].date).toBe("2026-04-16");
  });

  test("counts items per day", () => {
    const today = new Date(2026, 3, 16, 12);
    const items = [
      itemOn(2026, 4, 14),
      itemOn(2026, 4, 14),
      itemOn(2026, 4, 15),
      itemOn(2026, 4, 16),
    ];
    const cells = computeHeatmap(items, { weeks: 1, today });
    const byDate = Object.fromEntries(cells.map((c) => [c.date, c.count]));
    expect(byDate["2026-04-14"]).toBe(2);
    expect(byDate["2026-04-15"]).toBe(1);
    expect(byDate["2026-04-16"]).toBe(1);
  });
});

describe("computeTotals", () => {
  test("handles empty data", () => {
    expect(computeTotals([], [])).toEqual({
      totalLists: 0,
      totalItems: 0,
      avgItemsPerList: 0,
      daysActive: 0,
    });
  });

  test("averages items per list and dedupes days", () => {
    const lists = [{ $id: "a" }, { $id: "b" }, { $id: "c" }];
    const items = [
      itemOn(2026, 4, 1),
      itemOn(2026, 4, 1),
      itemOn(2026, 4, 2),
      itemOn(2026, 4, 3),
      itemOn(2026, 4, 3),
      itemOn(2026, 4, 3),
    ];
    expect(computeTotals(lists, items)).toEqual({
      totalLists: 3,
      totalItems: 6,
      avgItemsPerList: 2,
      daysActive: 3,
    });
  });
});

describe("computeMoodDistribution", () => {
  test("empty when no moods set", () => {
    expect(computeMoodDistribution([{}, { mood: null }, { mood: "" }])).toEqual(
      [],
    );
  });

  test("lowercases, trims, and sorts desc by count then alpha on ties", () => {
    const lists = [
      { mood: "Calm" },
      { mood: "calm" },
      { mood: "  GRATEFUL  " },
      { mood: "grateful" },
      { mood: "hopeful" },
    ];
    expect(computeMoodDistribution(lists)).toEqual([
      { mood: "calm", count: 2 },
      { mood: "grateful", count: 2 },
      { mood: "hopeful", count: 1 },
    ]);
  });
});
