import { useEffect, useRef } from "react";
import { MOODS } from "./moods";

// Fixed-position popover anchored to its trigger's bounding rect. Closes on
// outside click. Width 240, paper background, paper-edge border, radius 12.
const MoodPicker = ({ value, onChange, onClose, anchor, allowClear = true }) => {
  const ref = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    // Defer so the click that opened us doesn't immediately close us.
    const t = setTimeout(() => document.addEventListener("mousedown", onDown), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
    };
  }, [onClose]);

  const pos = anchor ? anchor.getBoundingClientRect() : null;
  const style = pos
    ? {
        position: "fixed",
        top: pos.bottom + 6,
        left: Math.max(12, Math.min(pos.right - 240, window.innerWidth - 252)),
        width: 240,
      }
    : { position: "fixed", top: 80, right: 24, width: 240 };

  return (
    <div
      ref={ref}
      style={{
        ...style,
        zIndex: 60,
        background: "var(--paper)",
        border: "1px solid var(--paper-edge)",
        borderRadius: "var(--r-md)",
        padding: 6,
        boxShadow: "0 12px 32px rgba(20,18,14,.18), 0 2px 6px rgba(20,18,14,.08)",
      }}
      role="listbox"
      aria-label="Mood"
    >
      <div
        style={{
          font: "500 10px/1 var(--font-mono)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
          padding: "8px 10px 6px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>How does it feel?</span>
        {allowClear && value && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              onClose();
            }}
            style={{
              background: "transparent",
              border: 0,
              color: "var(--ink-mute)",
              cursor: "pointer",
              font: "italic 400 11px/1 var(--font-serif)",
              letterSpacing: 0,
              textTransform: "none",
              padding: 2,
            }}
          >
            clear
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {MOODS.map((m) => {
          const active = value === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => {
                onChange(m.id);
                onClose();
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "var(--paper-deep)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 8,
                background: active ? "var(--paper-deep)" : "transparent",
                border: 0,
                cursor: "pointer",
                textAlign: "left",
                font: "400 14px/1 var(--font-serif)",
                color: "var(--ink)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "var(--r-full)",
                  background: m.color,
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                }}
              >
                {m.glyph}
              </span>
              {m.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodPicker;
