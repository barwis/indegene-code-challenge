import { useRef, useEffect } from "react";

export const useAutoResize = (value: string, maxRows = 4) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
  }, [value, maxRows]);

  return ref;
};
