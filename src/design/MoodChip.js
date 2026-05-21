import { moodFor } from "./moods";

// Round pill with colored dot + name. Optional onClick opens MoodPicker.
const MoodChip = ({ mood, onClick, size = "md" }) => {
  const m = moodFor(mood);
  if (!m) return null;
  const pad = size === "sm" ? "4px 10px 4px 4px" : "6px 12px 6px 6px";
  const dotSize = size === "sm" ? 16 : 20;
  const fs = size === "sm" ? 12 : 13;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: pad,
        borderRadius: "var(--r-full)",
        background: "transparent",
        border: "1px solid var(--paper-edge)",
        font: `500 ${fs}px/1 var(--font-sans)`,
        color: "var(--ink)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "var(--r-full)",
          background: m.color,
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: dotSize * 0.6,
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        {m.glyph}
      </span>
      {m.name}
    </button>
  );
};

export default MoodChip;
