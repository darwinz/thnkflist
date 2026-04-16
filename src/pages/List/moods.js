export const MOOD_OPTIONS = [
  { value: "calm", glyph: "🌿" },
  { value: "grateful", glyph: "🙏" },
  { value: "joyful", glyph: "😄" },
  { value: "content", glyph: "🙂" },
  { value: "reflective", glyph: "🌙" },
  { value: "energized", glyph: "⚡️" },
  { value: "tired", glyph: "😴" },
  { value: "stressed", glyph: "😣" },
  { value: "hopeful", glyph: "🌱" },
];

export function moodGlyph(value) {
  if (!value) return "";
  const hit = MOOD_OPTIONS.find((m) => m.value === value.toLowerCase());
  return hit ? hit.glyph : "🏷️";
}
