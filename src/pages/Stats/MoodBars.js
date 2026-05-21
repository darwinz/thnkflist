import { MOODS, moodFor } from "../../design/moods";

// One row per mood, sorted by count desc. 3-column grid:
// [120px label] [1fr bar] [70px counts].
const MoodBars = ({ distribution }) => {
  if (!distribution || distribution.length === 0) {
    return (
      <div
        style={{
          font: "italic 400 14px/1.5 var(--font-serif)",
          color: "var(--ink-mute)",
          padding: "8px 0",
        }}
      >
        tag a list with a mood to see how it broke down.
      </div>
    );
  }

  // Build a full row for every canonical mood so untracked moods still appear
  // (count 0). That gives the chart a stable shape regardless of usage.
  const byMood = Object.fromEntries(
    distribution.map(({ mood, count }) => [mood, count]),
  );
  const rows = MOODS.map((m) => ({
    mood: m,
    count: byMood[m.id] ?? 0,
  })).sort((a, b) => b.count - a.count || a.mood.name.localeCompare(b.mood.name));

  const totalKnown = rows.reduce((s, r) => s + r.count, 0);
  const max = rows[0]?.count || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map(({ mood: m, count }) => {
        const pct = max ? (count / max) * 100 : 0;
        const share = totalKnown ? Math.round((count / totalKnown) * 100) : 0;
        return (
          <div
            key={m.id}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 80px",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "var(--r-full)",
                  background: m.color,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  font: "400 13px/1 var(--font-sans)",
                  color: count ? "var(--ink)" : "var(--ink-mute)",
                }}
              >
                {m.name}
              </span>
            </div>
            <div
              style={{
                height: 22,
                background: "var(--paper-deep)",
                borderRadius: 4,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.max(pct, count > 0 ? 4 : 0)}%`,
                  background: m.color,
                  opacity: 0.85,
                  transition: "width .4s ease",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                font: "500 11px/1 var(--font-mono)",
                color: "var(--ink-mute)",
              }}
            >
              <span style={{ color: count ? "var(--ink)" : "var(--ink-mute)" }}>
                {count}
              </span>
              <span>{share}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Backwards-compat — if anything still imports moodFor from here.
export { moodFor };
export default MoodBars;
