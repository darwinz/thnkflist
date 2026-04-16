import { moodGlyph } from "../List/moods";

const MoodChart = ({ distribution }) => {
  if (!distribution || distribution.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">Moods</h2>
        <p className="text-sm text-gray-500">
          Tag your lists with a mood to see a breakdown here.
        </p>
      </section>
    );
  }

  const max = distribution[0]?.count ?? 1;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Moods</h2>
      <ul className="space-y-2">
        {distribution.map(({ mood, count }) => {
          const pct = Math.max(4, Math.round((count / max) * 100));
          return (
            <li key={mood} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="w-5 text-center"
                title={mood}
              >
                {moodGlyph(mood)}
              </span>
              <span className="w-28 text-sm capitalize">{mood}</span>
              <div className="flex-1 bg-gray-100 rounded-sm overflow-hidden h-3">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm tabular-nums text-gray-600">
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default MoodChart;
