import { useEffect, useState, useCallback } from "react";

// Canonical palettes from the design handoff. Authoritative — do not edit.
export const PALETTES = {
  paper: {
    name: "Paper",
    paper: "#F6F1E4",
    deep: "#EDE5D1",
    edge: "#DFD4B8",
    ink: "#2A2620",
    soft: "#5C544A",
    mute: "#8B8275",
    accent: "#6E8268",
    accentSoft: "#DDE3D4",
  },
  linen: {
    name: "Linen",
    paper: "#F2EEE7",
    deep: "#E5DFD4",
    edge: "#D2C9B7",
    ink: "#1F2024",
    soft: "#4D4E55",
    mute: "#7C7E87",
    accent: "#5A4256",
    accentSoft: "#E3DAE0",
  },
  twilight: {
    name: "Twilight",
    paper: "#EDE3DD",
    deep: "#E0D2CA",
    edge: "#C9B6AB",
    ink: "#2A1F2A",
    soft: "#544354",
    mute: "#85738A",
    accent: "#B4893F",
    accentSoft: "#F0DDB8",
  },
  inkblot: {
    name: "Inkblot",
    paper: "#F8F6F1",
    deep: "#EBE7DC",
    edge: "#D9D3C2",
    ink: "#16140F",
    soft: "#3F3B33",
    mute: "#807A6D",
    accent: "#16140F",
    accentSoft: "#E7E2D2",
  },
};

export const DARK_PALETTES = {
  paper: {
    paper: "#1E1B16",
    deep: "#27231C",
    edge: "#3A352A",
    ink: "#F0EAD7",
    soft: "#BFB7A0",
    mute: "#857E69",
    accent: "#A8BC9D",
    accentSoft: "#2F392B",
  },
  linen: {
    paper: "#1B1C20",
    deep: "#25272C",
    edge: "#383A41",
    ink: "#EAE6DC",
    soft: "#B5B0A4",
    mute: "#7B7872",
    accent: "#C9B0C2",
    accentSoft: "#2E2530",
  },
  twilight: {
    paper: "#221A22",
    deep: "#2D2330",
    edge: "#42333F",
    ink: "#F0E1D8",
    soft: "#BBA59E",
    mute: "#85706E",
    accent: "#E1B564",
    accentSoft: "#3A2E1C",
  },
  inkblot: {
    paper: "#0F0E0B",
    deep: "#1B1914",
    edge: "#2C2920",
    ink: "#F2EEDF",
    soft: "#B5AC95",
    mute: "#7A7363",
    accent: "#F2EEDF",
    accentSoft: "#1E1C16",
  },
};

const DEFAULTS = {
  layout: "library",
  palette: "inkblot",
  dark: false,
  bodyType: "serif",
  moodTreatment: "chip",
};

const STORAGE_KEY = "thnkflist:prefs:v1";

function loadPrefs() {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function savePrefs(prefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore — non-fatal
  }
}

/**
 * useThemePrefs — reads user preferences and applies palette/dark to :root.
 * Returns [prefs, setPrefs(patch)].
 */
export function useThemePrefs() {
  const [prefs, _setPrefs] = useState(loadPrefs);

  useEffect(() => {
    const p = prefs.dark
      ? DARK_PALETTES[prefs.palette] ?? DARK_PALETTES.paper
      : PALETTES[prefs.palette] ?? PALETTES.paper;
    const root = document.documentElement.style;
    root.setProperty("--paper", p.paper);
    root.setProperty("--paper-deep", p.deep);
    root.setProperty("--paper-edge", p.edge);
    root.setProperty("--ink", p.ink);
    root.setProperty("--ink-soft", p.soft);
    root.setProperty("--ink-mute", p.mute);
    root.setProperty("--accent", p.accent);
    root.setProperty("--accent-soft", p.accentSoft);
    document.body.classList.toggle("dark", !!prefs.dark);
    // theme-color meta keeps mobile chrome in sync
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", p.paper);
  }, [prefs.palette, prefs.dark]);

  const setPrefs = useCallback((patch) => {
    _setPrefs((prev) => {
      const next = { ...prev, ...patch };
      savePrefs(next);
      return next;
    });
  }, []);

  return [prefs, setPrefs];
}
