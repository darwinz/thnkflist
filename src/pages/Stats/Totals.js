const Stat = ({ label, value }) => (
  <div>
    <div className="text-3xl font-semibold tabular-nums">{value}</div>
    <div className="text-xs uppercase tracking-wide text-gray-500 mt-1">
      {label}
    </div>
  </div>
);

const Totals = ({ totalLists, totalItems, avgItemsPerList, daysActive }) => (
  <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
    <Stat label="Total lists" value={totalLists} />
    <Stat label="Total items" value={totalItems} />
    <Stat label="Avg items / list" value={avgItemsPerList} />
    <Stat label="Days active" value={daysActive} />
  </section>
);

export default Totals;
