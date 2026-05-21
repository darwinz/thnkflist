import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { FetchState, useStats } from "../../hooks";
import Mark from "../../design/Mark";
import Btn from "../../design/Btn";
import {
  computeHeatmap,
  computeMoodDistribution,
  computeStreak,
  computeTotals,
} from "./compute";
import Heatmap from "./Heatmap";
import MoodBars from "./MoodBars";

const Stat = ({ label, value, unit, hint }) => (
  <div
    style={{
      background: "var(--paper)",
      border: "1px solid var(--paper-edge)",
      borderRadius: 12,
      padding: "20px 22px",
      minHeight: 110,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}
  >
    <div
      style={{
        font: "500 10px/1 var(--font-mono)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--ink-mute)",
      }}
    >
      {label}
    </div>
    <div
      style={{
        font: "300 44px/1 var(--font-serif)",
        letterSpacing: "-0.03em",
        color: "var(--ink)",
        display: "flex",
        alignItems: "baseline",
        gap: 8,
      }}
    >
      {value}
      {unit && (
        <span
          style={{
            font: "italic 400 16px/1 var(--font-serif)",
            color: "var(--ink-soft)",
          }}
        >
          {unit}
        </span>
      )}
    </div>
    {hint && (
      <div
        style={{
          marginTop: "auto",
          font: "italic 400 12px/1.4 var(--font-serif)",
          color: "var(--ink-soft)",
        }}
      >
        {hint}
      </div>
    )}
  </div>
);

const SectionCard = ({ title, children }) => (
  <section
    style={{
      background: "var(--paper)",
      border: "1px solid var(--paper-edge)",
      borderRadius: 12,
      padding: "28px 28px 32px",
    }}
  >
    <h2
      style={{
        font: "300 28px/1.05 var(--font-serif)",
        letterSpacing: "-0.02em",
        color: "var(--ink)",
        margin: "0 0 22px",
      }}
    >
      {title}
      <span style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>.</span>
    </h2>
    {children}
  </section>
);

const Stats = ({ user, dispatch }) => {
  const navigate = useNavigate();
  const [{ isLoading, isError, lists, items }] = useStats(user.$id);

  const metrics = useMemo(() => {
    if (isLoading) return null;
    return {
      streak: computeStreak(items),
      heatmap: computeHeatmap(items, { weeks: 18 }),
      totals: computeTotals(lists, items),
      moods: computeMoodDistribution(lists),
    };
  }, [isLoading, lists, items]);

  const handleLogout = async () => {
    dispatch?.({ type: FetchState.FETCH_INIT });
    try {
      await api.deleteCurrentSession();
      dispatch?.({ type: FetchState.FETCH_SUCCESS, payload: null });
    } catch {
      dispatch?.({ type: FetchState.FETCH_FAILURE });
    }
  };

  const handleNew = async () => {
    try {
      const list = await api.createList(user.$id);
      navigate(`/lists/${list.$id}`);
    } catch (e) {
      console.warn("create list failed", e);
    }
  };

  const oldestDate = lists.length
    ? new Date(lists[lists.length - 1].$createdAt)
    : null;
  const daysSpan = oldestDate
    ? Math.max(1, Math.ceil((Date.now() - oldestDate.getTime()) / 86400000) + 1)
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--paper-deep)",
      }}
    >
      {/* top bar */}
      <header
        style={{
          background: "var(--paper)",
          borderBottom: "1px solid var(--paper-edge)",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Mark size={24} />
          <span style={{ font: "400 18px/1 var(--font-serif)", letterSpacing: "-0.02em" }}>
            thnkflist
          </span>
          <span style={{ font: "400 13px/1 var(--font-sans)", color: "var(--ink-mute)" }}>
            /
          </span>
          <span
            style={{
              font: "italic 400 15px/1 var(--font-serif)",
              color: "var(--ink-soft)",
            }}
          >
            looking back
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn kind="secondary" size="sm" onClick={() => navigate("/lists")}>
            ← back to today
          </Btn>
          <Btn kind="ghost" size="sm" onClick={handleLogout}>
            log out
          </Btn>
          <Btn kind="primary" size="sm" onClick={handleNew}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>＋</span> New list
          </Btn>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "48px 32px 96px",
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        {isError && (
          <div
            style={{
              padding: "16px 20px",
              background: "var(--paper)",
              border: "1px solid var(--paper-edge)",
              borderRadius: 12,
              color: "var(--ink-soft)",
              font: "400 14px/1.5 var(--font-sans)",
            }}
          >
            Couldn't load your stats.
          </div>
        )}

        {isLoading || !metrics ? (
          <div
            style={{
              font: "italic 400 14px/1 var(--font-serif)",
              color: "var(--ink-mute)",
            }}
          >
            loading…
          </div>
        ) : (
          <>
            {/* hero */}
            <section>
              <div
                style={{
                  font: "500 10px/1 var(--font-mono)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink-mute)",
                  marginBottom: 12,
                }}
              >
                The last {daysSpan} day{daysSpan === 1 ? "" : "s"}
              </div>
              <h1
                style={{
                  font: "300 56px/1 var(--font-serif)",
                  letterSpacing: "-0.03em",
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                {metrics.totals.totalLists} list
                {metrics.totals.totalLists === 1 ? "" : "s"},{" "}
                <span style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>kept.</span>
              </h1>
              <p
                style={{
                  font: "italic 400 16px/1.6 var(--font-serif)",
                  color: "var(--ink-soft)",
                  marginTop: 16,
                  maxWidth: 600,
                }}
              >
                {metrics.totals.totalItems} small thing
                {metrics.totals.totalItems === 1 ? "" : "s"} noticed across{" "}
                {metrics.totals.daysActive} different day
                {metrics.totals.daysActive === 1 ? "" : "s"}. a quiet record of
                what's gone well.
              </p>
            </section>

            {/* stat grid */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              <Stat
                label="Current streak"
                value={metrics.streak.current}
                unit={metrics.streak.current === 1 ? "day" : "days"}
                hint="consecutive days with a list"
              />
              <Stat
                label="Longest streak"
                value={metrics.streak.longest}
                unit={metrics.streak.longest === 1 ? "day" : "days"}
              />
              <Stat
                label="Days active"
                value={metrics.totals.daysActive}
                hint="unique days you added to a list"
              />
              <Stat
                label="Total lists"
                value={metrics.totals.totalLists}
              />
              <Stat
                label="Total items"
                value={metrics.totals.totalItems}
                hint="small things, noticed"
              />
              <Stat
                label="Items per list"
                value={metrics.totals.avgItemsPerList}
                unit="avg"
              />
            </section>

            {/* calendar */}
            <SectionCard title="The calendar">
              <Heatmap cells={metrics.heatmap} />
            </SectionCard>

            {/* moods */}
            <SectionCard title="How it felt">
              <MoodBars distribution={metrics.moods} />
            </SectionCard>
          </>
        )}
      </main>
    </div>
  );
};

export default Stats;
