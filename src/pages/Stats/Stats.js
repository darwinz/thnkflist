import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStats } from "../../hooks";
import Alert from "../Alert/Alert";
import Heatmap from "./Heatmap";
import MoodChart from "./MoodChart";
import Streaks from "./Streaks";
import Totals from "./Totals";
import {
  computeHeatmap,
  computeMoodDistribution,
  computeStreak,
  computeTotals,
} from "./compute";

const Stats = ({ user }) => {
  const [{ isLoading, isError, lists, items }] = useStats(user.$id);

  const metrics = useMemo(() => {
    if (isLoading) return null;
    return {
      streak: computeStreak(items),
      heatmap: computeHeatmap(items, { weeks: 53 }),
      totals: computeTotals(lists, items),
      moods: computeMoodDistribution(lists),
    };
  }, [isLoading, lists, items]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100">
        <Link to="/lists" className="text-xl font-bold tracking-tight">
          Thnkflist
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/lists"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Back to lists
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 py-8 space-y-10">
        <h1 className="text-3xl font-semibold">Your stats</h1>

        {isError && (
          <Alert color="red" message="Couldn't load your stats." />
        )}

        {isLoading || !metrics ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <>
            <Streaks
              current={metrics.streak.current}
              longest={metrics.streak.longest}
            />
            <Heatmap cells={metrics.heatmap} />
            <Totals
              totalLists={metrics.totals.totalLists}
              totalItems={metrics.totals.totalItems}
              avgItemsPerList={metrics.totals.avgItemsPerList}
              daysActive={metrics.totals.daysActive}
            />
            <MoodChart distribution={metrics.moods} />
          </>
        )}
      </main>
    </div>
  );
};

export default Stats;
