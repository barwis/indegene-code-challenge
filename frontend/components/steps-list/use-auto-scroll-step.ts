import { useRef, useEffect } from "react";

const useAutoScrollStep = (isActive: boolean) => {
  const ref = useRef<HTMLButtonElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (isActive && ref.current) {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      ref.current.scrollIntoView({
        behavior: reducedMotion ? "instant" : "smooth",
        block: "center",
      });
    }
  }, [isActive]);

  return ref;
};

export { useAutoScrollStep };
