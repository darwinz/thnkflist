// Petal — a single, soft, gathered shape. The brand mark.
// Filled in Clay (#C68C72) by default; mono variant takes a single color
// (defaults to currentColor) for dark or accent surfaces. A faint vein
// highlight runs down the center in paper color at low opacity so it
// disappears at small sizes.

const PETAL_D =
  "M 60 16 C 84 36, 92 60, 84 84 C 76 100, 60 104, 48 96 C 32 88, 24 68, 36 44 C 44 28, 52 20, 60 16 Z";
const VEIN_D = "M 56 32 C 60 48, 60 68, 56 84";

const Mark = ({ size = 28, mono = false, color }) => {
  const fill = mono ? color || "currentColor" : "#C68C72";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <path d={PETAL_D} fill={fill} />
      <path
        d={VEIN_D}
        stroke="var(--paper)"
        strokeOpacity={mono ? 0.25 : 0.35}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default Mark;
