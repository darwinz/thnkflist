function intensityClass(count) {
  if (count === 0) return "bg-gray-100";
  if (count === 1) return "bg-emerald-200";
  if (count === 2) return "bg-emerald-300";
  if (count <= 4) return "bg-emerald-500";
  return "bg-emerald-700";
}

const Heatmap = ({ cells }) => {
  // cells come oldest-first; render as columns of 7 (one column per week).
  const columns = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Activity</h2>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.count} item${cell.count === 1 ? "" : "s"}`}
                className={`w-3 h-3 rounded-sm ${intensityClass(cell.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <span>Less</span>
        <span className="w-3 h-3 rounded-sm bg-gray-100" />
        <span className="w-3 h-3 rounded-sm bg-emerald-200" />
        <span className="w-3 h-3 rounded-sm bg-emerald-300" />
        <span className="w-3 h-3 rounded-sm bg-emerald-500" />
        <span className="w-3 h-3 rounded-sm bg-emerald-700" />
        <span>More</span>
      </div>
    </section>
  );
};

export default Heatmap;
