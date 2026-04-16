const Streaks = ({ current, longest }) => (
  <section className="flex gap-6">
    <div>
      <div className="text-5xl md:text-6xl font-bold tabular-nums">
        {current}
      </div>
      <div className="text-sm uppercase tracking-wide text-gray-500 mt-1">
        Current streak
      </div>
    </div>
    <div className="pl-6 border-l border-gray-200">
      <div className="text-5xl md:text-6xl font-bold tabular-nums text-gray-600">
        {longest}
      </div>
      <div className="text-sm uppercase tracking-wide text-gray-500 mt-1">
        Longest streak
      </div>
    </div>
  </section>
);

export default Streaks;
