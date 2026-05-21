// Brand glyph — three overlapping circles (sage, clay, honey) with a
// paper-colored dot in the center. Pure inline SVG, no assets.
const Mark = ({ size = 28, mono = false, color }) => {
  if (mono) {
    const c = color || "currentColor";
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="14" r="8" fill={c} fillOpacity=".95" />
        <circle cx="15" cy="29" r="8" fill={c} fillOpacity=".75" />
        <circle cx="33" cy="29" r="8" fill={c} fillOpacity=".6" />
        <circle cx="24" cy="24" r="4" fill="var(--paper)" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="14" r="8" fill="#9CAE92" />
      <circle cx="15" cy="29" r="8" fill="#C68C72" />
      <circle cx="33" cy="29" r="8" fill="#E1B564" />
      <circle cx="24" cy="24" r="4" fill="var(--paper)" />
    </svg>
  );
};

export default Mark;
