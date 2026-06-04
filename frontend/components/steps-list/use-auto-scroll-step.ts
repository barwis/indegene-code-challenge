import { useRef, useEffect } from "react";

const useAutoScrollStep = (isActive: boolean) => {
  const ref = useRef<HTMLButtonElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (!isActive || !ref.current) return;

    const el = ref.current;
    const scroll = () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      el.scrollIntoView({
        behavior: reducedMotion ? "instant" : "smooth",
        block: "center",
      });
    };

    // Tab panels use the `hidden` attribute; when the agent changes the step the
    // tab switch is a separate state update that commits after this effect runs.
    // Defer scroll so it fires after that re-render makes the panel visible.
    if (el.closest("[hidden]")) {
      const id = setTimeout(scroll, 0);
      return () => clearTimeout(id);
    }
    scroll();
  }, [isActive]);

  return ref;
};

export { useAutoScrollStep };
