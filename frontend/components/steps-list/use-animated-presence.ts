import { useState, useEffect, useRef } from "react";

/**
 * Drives enter/exit CSS transitions on a conditionally-rendered element.
 *
 * Problem: CSS transitions only fire on changes to existing elements.
 * Mounting directly at the final state causes an instant layout jump with no
 * animation. Unmounting immediately cuts off the exit animation mid-way.
 *
 * Solution:
 * - Enter: mount at the collapsed state, then switch to expanded on the next
 *   animation frame so the browser sees a real state change to transition.
 * - Exit: switch to collapsed first, wait for `duration` ms, then unmount.
 *
 * Returns `{ mounted, expanded }` — use `mounted` to guard rendering and
 * `expanded` to drive the CSS state (e.g. grid-rows-[1fr] vs grid-rows-[0fr]).
 */
export const useAnimatedPresence = (active: boolean, duration: number) => {
  const [mounted, setMounted] = useState(active);
  const [expanded, setExpanded] = useState(active);
  const unmountTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (active) {
      clearTimeout(unmountTimer.current);
      let innerFrame: number;
      const outerFrame = requestAnimationFrame(() => {
        setMounted(true);
        innerFrame = requestAnimationFrame(() => setExpanded(true));
      });
      return () => {
        cancelAnimationFrame(outerFrame);
        cancelAnimationFrame(innerFrame);
      };
    }

    const frame = requestAnimationFrame(() => {
      setExpanded(false);
      unmountTimer.current = setTimeout(() => setMounted(false), duration);
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(unmountTimer.current);
    };
  }, [active, duration]);

  return { mounted, expanded };
};
