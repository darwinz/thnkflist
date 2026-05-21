import { useEffect, useState } from "react";

// Returns whether the viewport currently matches a media query. Defaults to
// false during SSR. Live-updates on resize.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    // Safari < 14
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}

// Convenience — true on desktop-ish widths where the 3-column layouts work.
export const useIsWide = () => useMediaQuery("(min-width: 1100px)");
