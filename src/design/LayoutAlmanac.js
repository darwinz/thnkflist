import { useMemo } from "react";
import Mark from "./Mark";
import Btn from "./Btn";
import ListEditor from "./ListEditor";
import { moodFor } from "./moods";
import { useIsWide } from "./useViewport";

const fmtShort = (d) =>
  d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
const fmtTime = (d) =>
  d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const LayoutAlmanac = ({
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
  const wide = useIsWide();

  const groups = useMemo(() => {
    const map = new Map();
    lists.forEach((l) => {
      const d = new Date(l.$createdAt);
      const key = d.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(l);
    });
    return Array.from(map.entries());
  }, [lists]);

  const thread = (
    <aside
      style={{
        borderLeft: wide ? "1px solid var(--paper-edge)" : "none",
        borderTop: wide ? "none" : "1px solid var(--paper-edge)",
        background: "var(--paper-deep)",
        overflowY: "auto",
        padding: "32px 0",
        height: wide ? "100%" : "auto",
      }}
    >
      <div
        style={{
          font: "500 10px/1 var(--font-mono)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
          padding: "0 28px 18px",
        }}
      >
        The thread
      </div>

      <div style={{ position: "relative" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 42,
            top: 0,
            bottom: 0,
            width: 1,
            background: "var(--paper-edge)",
          }}
        />
        {groups.map(([dateKey, dayLists]) => {
          const d = new Date(dayLists[0].$createdAt);
          const isToday = sameDay(d, new Date());
          return (
            <div key={dateKey} style={{ padding: "0 28px", marginBottom: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  padding: "8px 0",
                  position: "relative",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "var(--r-full)",
                    background: "var(--ink-soft)",
                    marginLeft: 6,
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    font: "italic 400 13px/1 var(--font-serif)",
                    color: "var(--ink-soft)",
                  }}
                >
                  {isToday ? "today" : fmtShort(d).toLowerCase()}
                </div>
              </div>
              <div style={{ paddingLeft: 28, paddingTop: 4, paddingBottom: 12 }}>
                {dayLists.map((l) => {
                  const m = moodFor(l.mood);
                  const items = itemsByListId[l.$id] || [];
                  return (
                    <button
                      key={l.$id}
                      type="button"
                      onClick={() => onSelect(l.$id)}
                      onMouseEnter={(e) => {
                        if (l.$id !== selectedId)
                          e.currentTarget.style.background = "var(--paper)";
                      }}
                      onMouseLeave={(e) => {
                        if (l.$id !== selectedId)
                          e.currentTarget.style.background = "transparent";
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        background:
                          l.$id === selectedId ? "var(--paper)" : "transparent",
                        border: `1px solid ${
                          l.$id === selectedId ? "var(--ink-soft)" : "transparent"
                        }`,
                        borderRadius: 8,
                        padding: "8px 10px",
                        marginBottom: 4,
                        cursor: "pointer",
                        transition: "background .15s, border-color .15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            font: "400 13px/1.2 var(--font-serif)",
                            color: "var(--ink)",
                            fontStyle: l.title ? "normal" : "italic",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                            paddingRight: 8,
                          }}
                        >
                          {l.title || "untitled"}
                        </span>
                        {m && (
                          <span
                            aria-label={m.name}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "var(--r-full)",
                              background: m.color,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          font: "400 10px/1 var(--font-mono)",
                          color: "var(--ink-mute)",
                        }}
                      >
                        <span>{fmtTime(new Date(l.$createdAt)).toLowerCase()}</span>
                        <span>
                          {items.length} {items.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: wide ? "1fr 380px" : "1fr",
        gridTemplateRows: wide ? "1fr" : "auto 1fr auto",
        background: "var(--paper)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: wide ? "24px 56px" : "16px 20px",
            borderBottom: "1px solid var(--paper-edge)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mark size={24} />
            <span style={{ font: "400 18px/1 var(--font-serif)", letterSpacing: "-0.02em" }}>
              thnkflist
            </span>
            <span
              style={{
                marginLeft: 12,
                padding: "4px 10px",
                borderRadius: "var(--r-full)",
                font: "italic 400 12px/1 var(--font-serif)",
                color: "var(--ink-soft)",
                background: "var(--paper-deep)",
              }}
            >
              almanac
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Btn kind="ghost" size="sm" onClick={onShowStats}>looking back</Btn>
            <Btn kind="ghost" size="sm" onClick={onOpenSettings}>settings</Btn>
            <Btn kind="ghost" size="sm" onClick={onLogout}>log out</Btn>
            <Btn kind="primary" size="sm" onClick={onNew}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>＋</span> New list
            </Btn>
          </div>
        </div>

        <main style={{ flex: 1, overflowY: "auto", padding: wide ? "40px 56px 80px" : "24px 20px 60px" }}>
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
            {editorProps?.list && <ListEditor {...editorProps} layoutKind="almanac" />}
          </div>
        </main>
      </div>

      {thread}
    </div>
  );
};

export default LayoutAlmanac;
