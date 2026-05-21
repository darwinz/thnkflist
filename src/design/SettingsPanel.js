import { useEffect, useRef } from "react";
import { PALETTES } from "./theme";

const Row = ({ label, children }) => (
  <div style={{ marginBottom: 18 }}>
    <div
      style={{
        font: "500 10px/1 var(--font-mono)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--ink-mute)",
        marginBottom: 8,
      }}
    >
      {label}
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{children}</div>
  </div>
);

const Pill = ({ active, onClick, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      font: `${active ? 500 : 400} 12px/1 var(--font-sans)`,
      padding: "6px 12px",
      borderRadius: "var(--r-full)",
      border: `1px solid ${active ? "var(--ink-soft)" : "var(--paper-edge)"}`,
      background: active ? "var(--paper-deep)" : "transparent",
      color: "var(--ink)",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const Swatch = ({ active, onClick, palette, dark, title }) => {
  const colors = dark
    ? { paper: palette.paper, ink: palette.ink, accent: palette.accent }
    : palette;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        width: 56,
        height: 28,
        padding: 0,
        border: `2px solid ${active ? "var(--ink)" : "var(--paper-edge)"}`,
        borderRadius: 8,
        background: `linear-gradient(90deg, ${colors.paper} 0%, ${colors.paper} 60%, ${colors.accent} 60%, ${colors.accent} 100%)`,
        cursor: "pointer",
        position: "relative",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: colors.ink,
        }}
      />
    </button>
  );
};

const SettingsPanel = ({ prefs, setPrefs, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", onDown), 0);
    document.addEventListener("keydown", onEsc);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(20,18,14,.18)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-label="Settings"
        style={{
          width: 360,
          maxWidth: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--paper)",
          border: "1px solid var(--paper-edge)",
          borderRadius: "var(--r-md)",
          padding: "24px 22px",
          boxShadow: "0 12px 32px rgba(20,18,14,.18), 0 2px 6px rgba(20,18,14,.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 18,
          }}
        >
          <div style={{ font: "300 24px/1 var(--font-serif)", color: "var(--ink)" }}>
            Settings<span style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: 0,
              cursor: "pointer",
              font: "400 14px/1 var(--font-sans)",
              color: "var(--ink-soft)",
            }}
          >
            close
          </button>
        </div>

        <Row label="Layout">
          {["library", "desk", "almanac"].map((k) => (
            <Pill
              key={k}
              active={prefs.layout === k}
              onClick={() => setPrefs({ layout: k })}
            >
              {k}
            </Pill>
          ))}
        </Row>

        <Row label="Palette">
          {Object.entries(PALETTES).map(([k, p]) => (
            <Swatch
              key={k}
              palette={p}
              dark={prefs.dark}
              active={prefs.palette === k}
              onClick={() => setPrefs({ palette: k })}
              title={p.name}
            />
          ))}
        </Row>

        <Row label="Mode">
          <Pill active={!prefs.dark} onClick={() => setPrefs({ dark: false })}>
            light
          </Pill>
          <Pill active={prefs.dark} onClick={() => setPrefs({ dark: true })}>
            dark
          </Pill>
        </Row>

        <Row label="List items">
          <Pill
            active={prefs.bodyType === "serif"}
            onClick={() => setPrefs({ bodyType: "serif" })}
          >
            serif
          </Pill>
          <Pill
            active={prefs.bodyType === "sans"}
            onClick={() => setPrefs({ bodyType: "sans" })}
          >
            sans
          </Pill>
        </Row>

        <Row label="Mood treatment">
          {["chip", "tint", "header"].map((k) => (
            <Pill
              key={k}
              active={prefs.moodTreatment === k}
              onClick={() => setPrefs({ moodTreatment: k })}
            >
              {k}
            </Pill>
          ))}
        </Row>

        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid var(--paper-edge)",
            font: "italic 400 12px/1.5 var(--font-serif)",
            color: "var(--ink-mute)",
          }}
        >
          preferences live on this device.
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
