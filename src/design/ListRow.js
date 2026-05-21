import { useState } from "react";

// One editable gratitude item. Numbered (Geist Mono mute), serif (or sans)
// body, dashed bottom border. Hover → reveal × delete.
const ListRow = ({ index, value, font, readonly, onCommit, onRemove }) => {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <li
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 16,
        padding: "12px 0",
        borderBottom: "1px dashed var(--paper-edge)",
        position: "relative",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          font: "500 11px/1 var(--font-mono)",
          color: "var(--ink-mute)",
          minWidth: 24,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {editing && !readonly ? (
        <input
          autoFocus
          defaultValue={value}
          maxLength={500}
          onBlur={(e) => {
            const next = e.target.value;
            setEditing(false);
            if (next.trim() && next !== value) onCommit(next.trim());
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const next = e.currentTarget.value;
              setEditing(false);
              if (next.trim() && next !== value) onCommit(next.trim());
            }
            if (e.key === "Escape") setEditing(false);
          }}
          style={{
            flex: 1,
            background: "transparent",
            border: 0,
            outline: "none",
            font,
            color: "var(--ink)",
          }}
        />
      ) : (
        <span
          onClick={() => !readonly && setEditing(true)}
          style={{
            flex: 1,
            font,
            color: "var(--ink)",
            cursor: readonly ? "default" : "text",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {value}
        </span>
      )}

      {!readonly && hover && (
        <button
          type="button"
          onClick={onRemove}
          title="remove"
          aria-label="Remove item"
          style={{
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: "var(--ink-mute)",
            fontSize: 16,
            padding: "4px 6px",
            borderRadius: 4,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </li>
  );
};

export default ListRow;
