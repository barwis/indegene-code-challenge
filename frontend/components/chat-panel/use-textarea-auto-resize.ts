import { useRef, useLayoutEffect } from "react";

const useTextareaAutoResize = (value: string, maxRows = 4) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const recalc = () => {
      const style = getComputedStyle(el);
      const lineHeight =
        parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
      const paddingTop = parseFloat(style.paddingTop);
      const paddingBottom = parseFloat(style.paddingBottom);
      const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

      el.style.height = "auto";
      const next = el.scrollHeight;

      if (next > maxHeight) {
        el.style.height = `${maxHeight}px`;
        el.style.overflowY = "auto";
      } else {
        el.style.height = `${next}px`;
        el.style.overflowY = "hidden";
      }
    };

    recalc();

    // Re-run when the container width changes (viewport/panel resize) so the
    // height doesn't stay stale when text reflows. Observe the parent rather
    // than the textarea itself to avoid a resize loop.
    const observer = new ResizeObserver(recalc);
    if (el.parentElement) observer.observe(el.parentElement);
    return () => observer.disconnect();
  }, [value, maxRows]);

  return ref;
};

export { useTextareaAutoResize };
