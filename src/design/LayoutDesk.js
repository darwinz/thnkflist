import { useState } from "react";
import Mark from "./Mark";
import Btn from "./Btn";
import PastCard from "./PastCard";
import ListEditor from "./ListEditor";

const LayoutDesk = ({
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: "var(--paper)",
      }}
    >
      {/* top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          background: "var(--paper)",
          borderBottom: "1px solid transparent",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Mark size={22} />
          <span style={{ font: "400 16px/1 var(--font-serif)", letterSpacing: "-0.02em" }}>
            thnkflist
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Btn kind="ghost" size="sm" onClick={onShowStats}>looking back</Btn>
          <Btn kind="ghost" size="sm" onClick={() => setDrawerOpen(true)}>
            <span style={{ font: "400 13px/1 var(--font-mono)", color: "var(--ink-mute)" }}>
              {lists.length}
            </span>
            past lists
          </Btn>
          <Btn kind="ghost" size="sm" onClick={onOpenSettings}>settings</Btn>
          <Btn kind="ghost" size="sm" onClick={onLogout}>log out</Btn>
          <Btn kind="primary" size="sm" onClick={onNew}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>＋</span> New list
          </Btn>
        </div>
      </div>

      {/* center stage */}
      <main
        style={{
          height: "calc(100vh - 78px)",
          overflowY: "auto",
          padding: "40px 24px 80px",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {editorProps?.list && <ListEditor {...editorProps} layoutKind="desk" />}
        </div>
      </main>

      {/* peeking stack */}
      {!drawerOpen && lists.length > 0 && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open past lists"
          style={{
            position: "fixed",
            right: 28,
            bottom: 28,
            zIndex: 10,
            width: 110,
            height: 80,
            background: "transparent",
            border: 0,
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {[2, 1, 0].map((i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 8 - i * 4,
                  top: 8 + i * 4,
                  right: -8 + i * 4,
                  bottom: 0 + i * 4,
                  background: "var(--paper)",
                  border: "1px solid var(--paper-edge)",
                  borderRadius: 8,
                  boxShadow: "0 1px 4px rgba(20,18,14,.08)",
                  transform: `rotate(${(2 - i) * 1.5 - 1.5}deg)`,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: "400 11px/1 var(--font-mono)",
                color: "var(--ink-soft)",
                letterSpacing: "0.05em",
                zIndex: 5,
              }}
            >
              {lists.length} past
            </div>
          </div>
        </button>
      )}

      {/* drawer */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            background: "rgba(20,18,14,.18)",
            backdropFilter: "blur(2px)",
          }}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: 380,
              maxWidth: "92vw",
              background: "var(--paper-deep)",
              borderLeft: "1px solid var(--paper-edge)",
              padding: "28px 26px",
              overflowY: "auto",
              animation: "thnk-slideIn .25s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 24,
              }}
            >
              <div>
                <div
                  style={{
                    font: "500 10px/1 var(--font-mono)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ink-mute)",
                    marginBottom: 6,
                  }}
                >
                  Past lists
                </div>
                <div style={{ font: "300 28px/1 var(--font-serif)", color: "var(--ink)" }}>
                  {lists.length}, kept.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  font: "400 14px/1 var(--font-sans)",
                  color: "var(--ink-soft)",
                  padding: 4,
                }}
              >
                close
              </button>
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
                  onClick={() => {
                    onSelect(l.$id);
                    setDrawerOpen(false);
                  }}
                />
              );
            })}
          </aside>
        </div>
      )}
    </div>
  );
};

export default LayoutDesk;
