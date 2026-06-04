import { useEffect, useRef } from "react";

const useScrollToTop = <T extends HTMLElement = HTMLElement>() => {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const panel = ref.current?.closest('[role="tabpanel"]') as HTMLElement | null;
    if (panel) panel.scrollTop = 0;
  }, []);
  return ref;
};

export { useScrollToTop };
