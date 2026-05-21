import { moodFor } from "./moods";

const fmtShort = (d) =>
  d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
const fmtTime = (d) =>
  d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

/**
 * PastCard — paper-stack list preview used in Library right column.
 * Two "paper ghost" pseudo-elements below give the stack-of-paper effect.
 *
 * Props:
 *   list — { $id, title, mood, $createdAt }
 *   preview — string preview of items (optional)
 *   itemCount — number of items in the list
 *   active, onClick, compact
 */
const PastCard = ({ list, preview = "", itemCount = 0, active, onClick, compact }) => {
  const m = moodFor(list.mood);
  const date = new Date(list.$createdAt);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.borderColor = "var(--ink-mute)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.borderColor = "var(--paper-edge)";
      }}
      style={{
        position: "relative",
        background: active ? "var(--paper)" : "transparent",
        border: `1px solid ${active ? "var(--ink-soft)" : "var(--paper-edge)"}`,
        borderRadius: 10,
        padding: compact ? "12px 14px" : "14px 16px",
        cursor: "pointer",
        transition: "border-color .15s, background .15s, transform .15s",
        marginBottom: compact ? 18 : 22,
      }}
    >
      {/* paper stack ghosts */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 6,
          right: 6,
          bottom: -6,
          height: 8,
          background: "var(--paper-deep)",
          border: "1px solid var(--paper-edge)",
          borderTop: 0,
          borderRadius: "0 0 10px 10px",
          zIndex: -1,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: -12,
          height: 6,
          background: "var(--paper-deep)",
          border: "1px solid var(--paper-edge)",
          borderTop: 0,
          borderRadius: "0 0 10px 10px",
          zIndex: -2,
          opacity: 0.6,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
          gap: 8,
        }}
      >
        <span
          style={{
            font: "400 14px/1.2 var(--font-serif)",
            color: "var(--ink)",
            fontStyle: list.title ? "normal" : "italic",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {list.title || fmtShort(date)}
        </span>
        {m && (
          <span
            title={m.name}
            aria-label={m.name}
            style={{
              width: 10,
              height: 10,
              borderRadius: "var(--r-full)",
              background: m.color,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
        )}
      </div>
      <div
        style={{
          font: "400 10px/1 var(--font-mono)",
          color: "var(--ink-mute)",
          letterSpacing: "0.04em",
          marginBottom: 8,
        }}
      >
        {fmtShort(date).toLowerCase()} · {fmtTime(date).toLowerCase()}
      </div>
      {preview && (
        <p
          style={{
            margin: 0,
            font: "400 12px/1.5 var(--font-serif)",
            color: "var(--ink-soft)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {preview}
        </p>
      )}
      <div
        style={{
          marginTop: 8,
          font: "400 10px/1 var(--font-mono)",
          color: "var(--ink-mute)",
        }}
      >
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </div>
    </div>
  );
};

export default PastCard;
