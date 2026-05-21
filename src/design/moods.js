// Canonical mood definitions from the design handoff. Authoritative — never
// substitute the hex values. Each mood has an id, display name, glyph (single
// Unicode char), and color. Mood color is only ever used inside the mood chip
// and the past-card mood dot — never as a UI surface color.
export const MOODS = [
  { id: "calm",       name: "Calm",       glyph: "☁", color: "#A4B7C4" },
  { id: "grateful",   name: "Grateful",   glyph: "✿", color: "#E2A77E" },
  { id: "tired",      name: "Tired",      glyph: "☾", color: "#B3A5C2" },
  { id: "joyful",     name: "Joyful",     glyph: "☀", color: "#F0B66E" },
  { id: "content",    name: "Content",    glyph: "❋", color: "#A6BE9B" },
  { id: "reflective", name: "Reflective", glyph: "◐", color: "#7A6480" },
  { id: "energized",  name: "Energized",  glyph: "✦", color: "#DD7E5F" },
  { id: "stressed",   name: "Stressed",   glyph: "◈", color: "#C77670" },
  { id: "hopeful",    name: "Hopeful",    glyph: "⌖", color: "#DCC477" },
  { id: "anxious",    name: "Anxious",    glyph: "◌", color: "#97A2AC" },
];

export const moodMap = Object.fromEntries(MOODS.map((m) => [m.id, m]));

export function moodFor(value) {
  if (!value) return null;
  const key = String(value).toLowerCase().trim();
  return moodMap[key] ?? null;
}
