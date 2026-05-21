import { useMemo, useState } from "react";
import Mark from "./Mark";
import Btn from "./Btn";
import PastCard from "./PastCard";
import ListEditor from "./ListEditor";
import { MOODS } from "./moods";
import { useIsWide } from "./useViewport";

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const daysAgo = (d) => Math.floor((Date.now() - d.getTime()) / 86400000);

const FilterRow = ({ active, onClick, label, count }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "9px 12px",
      borderRadius: 8,
      background: active ? "var(--paper-deep)" : "transparent",
      border: 0,
      cursor: "pointer",
      width: "100%",
      font: `${active ? 500 : 400} 13px/1 var(--font-sans)`,
      color: active ? "var(--ink)" : "var(--ink-soft)",
      textAlign: "left",
      transition: "color .15s, background .15s",
    }}
    onMouseEnter={(e) => {
      if (!active) e.currentTarget.style.color = "var(--ink)";
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.color = "var(--ink-soft)";
    }}
  >
    <span>{label}</span>
    <span style={{ font: "400 10px/1 var(--font-mono)", color: "var(--ink-mute)" }}>
      {count}
    </span>
  </button>
);

const CardGroup = ({ label, lists, itemsByListId, selectedId, onSelect }) => (
  <div style={{ marginBottom: 32 }}>
    <div
      style={{
        font: "italic 400 13px/1 var(--font-serif)",
        color: "var(--ink-soft)",
        marginBottom: 14,
      }}
    >
      {label}
    </div>
    {lists.map((l) => {
      const items = itemsByListId[l.$id] || [];
      const preview =
        items
          .slice(0, 2)
          .map((it) => it.content)
          .join(" · ") + (items.length > 2 ? "…" : "");
      return (
        <PastCard
          key={l.$id}
          list={l}
          preview={preview}
          itemCount={items.length}
          active={l.$id === selectedId}
          onClick={() => onSelect(l.$id)}
        />
      );
    })}
  </div>
);

const LayoutLibrary = ({
  lists,
  itemsByListId,
  selectedId,
  onSelect,
  onNew,
  onShowStats,
  onLogout,
  onOpenSettings,
  editorProps,
}) => {
  const [filter, setFilter] = useState("all");
  const [moodFilter, setMoodFilter] = useState(null);
  const [railOpen, setRailOpen] = useState(false);
  const [pastOpen, setPastOpen] = useState(false);

  const today = useMemo(
    () => lists.filter((l) => sameDay(new Date(l.$createdAt), new Date())),
    [lists],
  );
  const week = useMemo(
    () =>
      lists.filter((l) => {
        const d = new Date(l.$createdAt);
        return !sameDay(d, new Date()) && daysAgo(d) <= 7;
      }),
    [lists],
  );
  const earlier = useMemo(
    () => lists.filter((l) => daysAgo(new Date(l.$createdAt)) > 7),
    [lists],
  );

  let visible = lists;
  if (filter === "today") visible = today;
  else if (filter === "week") visible = [...today, ...week];
  else if (filter === "earlier") visible = earlier;
  if (moodFilter) visible = visible.filter((l) => l.mood === moodFilter);

  const grouped = useMemo(() => {
    const g = { today: [], week: [], earlier: [] };
    visible.forEach((l) => {
      const d = new Date(l.$createdAt);
      if (sameDay(d, new Date())) g.today.push(l);
      else if (daysAgo(d) <= 7) g.week.push(l);
      else g.earlier.push(l);
    });
    return g;
  }, [visible]);

  const renderRail = () => (
    <aside
      style={{
        padding: "28px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        background: "var(--paper)",
        overflowY: "auto",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Mark size={26} />
        <span style={{ font: "400 19px/1 var(--font-serif)", letterSpacing: "-0.02em" }}>
          thnkflist
        </span>
      </div>

      <Btn kind="primary" onClick={onNew} style={{ width: "100%" }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>＋</span> New list
      </Btn>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <FilterRow active={filter === "all"} onClick={() => setFilter("all")} label="All" count={lists.length} />
        <FilterRow active={filter === "today"} onClick={() => setFilter("today")} label="Today" count={today.length} />
        <FilterRow active={filter === "week"} onClick={() => setFilter("week")} label="This week" count={today.length + week.length} />
        <FilterRow active={filter === "earlier"} onClick={() => setFilter("earlier")} label="Earlier" count={earlier.length} />
      </div>

      <div>
        <div
          style={{
            font: "500 10px/1 var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
            marginBottom: 10,
          }}
        >
          Filter by mood
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMoodFilter(moodFilter === m.id ? null : m.id)}
              title={m.name}
              aria-label={`Filter by ${m.name}`}
              style={{
                width: 22,
                height: 22,
                borderRadius: "var(--r-full)",
                background: m.color,
                border:
                  moodFilter === m.id ? "2px solid var(--ink)" : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
                opacity: moodFilter && moodFilter !== m.id ? 0.4 : 1,
                transition: "opacity .15s, border-color .15s",
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 24,
          borderTop: "1px solid var(--paper-edge)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={onShowStats}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "9px 12px",
            borderRadius: 8,
            background: "transparent",
            border: 0,
            cursor: "pointer",
            width: "100%",
            font: "400 13px/1 var(--font-sans)",
            color: "var(--ink-soft)",
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--ink)";
            e.currentTarget.style.background = "var(--paper-deep)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--ink-soft)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span>Looking back</span>
          <span style={{ font: "italic 400 12px/1 var(--font-serif)", color: "var(--ink-mute)" }}>
            stats →
          </span>
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          style={{
            background: "transparent",
            border: 0,
            cursor: "pointer",
            padding: "4px 12px",
            font: "400 12px/1 var(--font-sans)",
            color: "var(--ink-mute)",
            textAlign: "left",
          }}
        >
          settings
        </button>
        <button
          type="button"
          onClick={onLogout}
          style={{
            background: "transparent",
            border: 0,
            cursor: "pointer",
            padding: "4px 12px",
            font: "400 12px/1 var(--font-sans)",
            color: "var(--ink-mute)",
            textAlign: "left",
          }}
        >
          log out
        </button>
        <div
          style={{
            font: "italic 400 13px/1.5 var(--font-serif)",
            color: "var(--ink-soft)",
            paddingTop: 8,
          }}
        >
          "small things, kept."
        </div>
      </div>
    </aside>
  );

  const renderPast = () => (
    <aside
      style={{
        padding: "32px 26px",
        background: "var(--paper-deep)",
        overflowY: "auto",
        height: "100%",
      }}
    >
      <div
        style={{
          font: "500 10px/1 var(--font-mono)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Past lists</span>
        <span>{visible.length}</span>
      </div>

      {grouped.today.length > 0 && (
        <CardGroup
          label="Today"
          lists={grouped.today}
          itemsByListId={itemsByListId}
          selectedId={selectedId}
          onSelect={(id) => {
            onSelect(id);
            setPastOpen(false);
          }}
        />
      )}
      {grouped.week.length > 0 && (
        <CardGroup
          label="Earlier this week"
          lists={grouped.week}
          itemsByListId={itemsByListId}
          selectedId={selectedId}
          onSelect={(id) => {
            onSelect(id);
            setPastOpen(false);
          }}
        />
      )}
      {grouped.earlier.length > 0 && (
        <CardGroup
          label="Earlier"
          lists={grouped.earlier}
          itemsByListId={itemsByListId}
          selectedId={selectedId}
          onSelect={(id) => {
            onSelect(id);
            setPastOpen(false);
          }}
        />
      )}
      {visible.length === 0 && (
        <div
          style={{
            font: "italic 400 14px/1.5 var(--font-serif)",
            color: "var(--ink-mute)",
            padding: "24px 0",
          }}
        >
          nothing here yet.
        </div>
      )}
    </aside>
  );

  const wide = useIsWide();

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: wide ? "220px 1fr 340px" : "1fr",
        background: "var(--paper)",
      }}
    >
      {/* Mobile top bar */}
      {!wide && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            background: "var(--paper)",
            borderBottom: "1px solid var(--paper-edge)",
          }}
        >
          <button
            type="button"
            onClick={() => setRailOpen(true)}
            style={{
              background: "transparent",
              border: 0,
              cursor: "pointer",
              font: "400 22px/1 var(--font-mono)",
              color: "var(--ink-soft)",
            }}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mark size={20} />
            <span style={{ font: "400 16px/1 var(--font-serif)" }}>thnkflist</span>
          </div>
          <button
            type="button"
            onClick={() => setPastOpen(true)}
            style={{
              background: "transparent",
              border: 0,
              cursor: "pointer",
              font: "400 13px/1 var(--font-sans)",
              color: "var(--ink-soft)",
            }}
            aria-label="Open past lists"
          >
            past · {lists.length}
          </button>
        </div>
      )}

      {/* Desktop rail */}
      {wide && (
        <div style={{ borderRight: "1px solid var(--paper-edge)" }}>{renderRail()}</div>
      )}

      {/* Center */}
      <main
        style={{
          padding: wide ? "48px 64px" : "32px 20px",
          overflowY: "auto",
          background: "var(--paper)",
        }}
      >
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          {editorProps?.list && <ListEditor {...editorProps} layoutKind="library" />}
        </div>
      </main>

      {/* Desktop past column */}
      {wide && (
        <div style={{ borderLeft: "1px solid var(--paper-edge)" }}>{renderPast()}</div>
      )}

      {/* Mobile drawers */}
      {!wide && railOpen && (
        <div
          onClick={() => setRailOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            background: "rgba(20,18,14,.18)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 260,
              background: "var(--paper)",
              borderRight: "1px solid var(--paper-edge)",
              animation: "thnk-slideIn .25s ease",
            }}
          >
            {renderRail()}
          </div>
        </div>
      )}
      {!wide && pastOpen && (
        <div
          onClick={() => setPastOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            background: "rgba(20,18,14,.18)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: 320,
              background: "var(--paper-deep)",
              borderLeft: "1px solid var(--paper-edge)",
              animation: "thnk-slideIn .25s ease",
            }}
          >
            {renderPast()}
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutLibrary;
