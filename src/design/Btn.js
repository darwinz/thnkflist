import { useState } from "react";

// Four kinds × two sizes. Rounded pills, 8px gap for icon+label.
const KIND_STYLES = {
  primary:   { background: "var(--ink)",      color: "var(--paper)",    borderColor: "transparent" },
  secondary: { background: "transparent",     color: "var(--ink)",      borderColor: "var(--paper-edge)" },
  ghost:     { background: "transparent",     color: "var(--ink-soft)", borderColor: "transparent" },
  accent:    { background: "var(--accent)",   color: "var(--paper)",    borderColor: "transparent" },
};

const Btn = ({
  children,
  onClick,
  kind = "primary",
  size = "md",
  type = "button",
  disabled = false,
  style,
  title,
  ariaLabel,
}) => {
  const [hover, setHover] = useState(false);

  const base = {
    font: `500 ${size === "sm" ? 13 : 14}px/1 var(--font-sans)`,
    padding: size === "sm" ? "8px 14px" : "10px 18px",
    borderRadius: "var(--r-full)",
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    whiteSpace: "nowrap",
    transition: "background .15s ease, border-color .15s ease, color .15s ease, opacity .15s ease",
    opacity: disabled ? 0.5 : 1,
  };

  const styled = { ...base, ...KIND_STYLES[kind], ...style };

  if (hover && !disabled) {
    if (kind === "secondary") styled.borderColor = "var(--ink-soft)";
    if (kind === "ghost") styled.color = "var(--ink)";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={styled}
    >
      {children}
    </button>
  );
};

export default Btn;
