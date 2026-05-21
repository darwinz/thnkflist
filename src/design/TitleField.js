import { useState } from "react";

// Inline-editable list title. Newsreader 300 44px display, italic ink-soft "."
// at the end. Click → input. Enter / blur commits, Escape cancels.
const TITLE_STYLE = {
  font: "300 44px/1.05 var(--font-serif)",
  letterSpacing: "-0.03em",
  color: "var(--ink)",
  background: "transparent",
  border: 0,
  outline: "none",
  padding: 0,
  margin: 0,
  width: "100%",
  fontFamily: "var(--font-serif)",
};

const TitleField = ({ value, placeholder = "untitled", readonly, onChange }) => {
  const [editing, setEditing] = useState(false);
  const isEmpty = !value;

  const Dot = () => (
    <span style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>.</span>
  );

  if (readonly) {
    return (
      <h1 style={{ ...TITLE_STYLE, color: isEmpty ? "var(--ink-mute)" : "var(--ink)" }}>
        {value || placeholder}
        <Dot />
      </h1>
    );
  }

  if (editing) {
    return (
      <input
        autoFocus
        defaultValue={value}
        maxLength={120}
        onBlur={(e) => {
          onChange(e.target.value.trim());
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange(e.currentTarget.value.trim());
            setEditing(false);
          }
          if (e.key === "Escape") setEditing(false);
        }}
        style={TITLE_STYLE}
        aria-label="List title"
      />
    );
  }

  return (
    <h1
      onClick={() => setEditing(true)}
      title="click to rename"
      style={{
        ...TITLE_STYLE,
        cursor: "text",
        color: isEmpty ? "var(--ink-mute)" : "var(--ink)",
        fontStyle: isEmpty ? "italic" : "normal",
      }}
    >
      {value || placeholder}
      <Dot />
    </h1>
  );
};

export default TitleField;
