// 18-week × 7-day grid, oldest-first input. Intensity steps via color-mix
// against the accent + paper-deep, so the heatmap repaints when the palette
// changes — no manual color updates needed.

const intensityColor = (count) => {
  if (count === 0) return "var(--paper-deep)";
  const pct = count === 1 ? 22 : count === 2 ? 45 : count <= 4 ? 70 : 100;
  if (pct === 100) return "var(--accent)";
  return `color-mix(in oklab, var(--accent) ${pct}%, var(--paper-deep))`;
};

const Heatmap = ({ cells }) => {
  // cells come oldest-first; render as columns of 7.
  const columns = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Pick month labels per column (label only when the month changes).
  const monthLabels = columns.map((col, i) => {
    const first = col[0];
    if (!first) return "";
    const [, m] = first.date.split("-");
    const prevFirst = columns[i - 1]?.[0];
    const prevM = prevFirst ? prevFirst.date.split("-")[1] : null;
    if (prevM === m) return "";
    return new Date(first.date + "T00:00:00")
      .toLocaleDateString(undefined, { month: "short" })
      .toLowerCase();
  });

  const dayLabels = ["s", "m", "t", "w", "t", "f", "s"];

  return (
    <div>
      {/* month labels */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 6,
          paddingLeft: 22,
          font: "400 10px/1 var(--font-mono)",
          color: "var(--ink-mute)",
          letterSpacing: "0.04em",
        }}
      >
        {monthLabels.map((m, i) => (
          <div key={i} style={{ width: 14, flexShrink: 0 }}>
            {m}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        {/* day-of-week column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            font: "400 9px/1 var(--font-mono)",
            color: "var(--ink-mute)",
            marginRight: 4,
            width: 14,
          }}
        >
          {dayLabels.map((d, i) => (
            <div key={i} style={{ height: 14, display: "flex", alignItems: "center" }}>
              {i % 2 === 1 ? d : ""}
            </div>
          ))}
        </div>

        {/* cells */}
        {columns.map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {col.map((cell) => {
              const isFuture = cell.date > todayKey;
              return (
                <div
                  key={cell.date}
                  title={`${cell.date} — ${cell.count} ${
                    cell.count === 1 ? "list" : "lists"
                  }`}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    border: isFuture
                      ? "1px dashed var(--paper-edge)"
                      : "1px solid var(--paper-edge)",
                    background: isFuture ? "transparent" : intensityColor(cell.count),
                    opacity: isFuture ? 0.35 : 1,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 6,
          marginTop: 14,
          font: "400 10px/1 var(--font-mono)",
          color: "var(--ink-mute)",
        }}
      >
        <span>less</span>
        {[0, 1, 2, 3, 5].map((n) => (
          <span
            key={n}
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              border: "1px solid var(--paper-edge)",
              background: intensityColor(n),
            }}
          />
        ))}
        <span>more</span>
      </div>
    </div>
  );
};

export default Heatmap;
