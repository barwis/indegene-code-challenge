import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";

// Pixels of drawer visible when closed — enough to show the handle bar + rounded corners.
const PEEK_PX = 28;

type Options = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

type DragState = { startY: number; startTime: number };

const useDrawerDrag = ({ isOpen, onOpen, onClose }: Options) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const reset = () => {
    dragRef.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: e.clientY, startTime: Date.now() };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const raw = e.clientY - dragRef.current.startY;
    // open: only drag down; closed: only drag up
    setDragOffset(isOpen ? Math.max(0, raw) : Math.min(0, raw));
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const delta = e.clientY - dragRef.current.startY;
    const velocity = delta / Math.max(1, Date.now() - dragRef.current.startTime);
    const drawerH = drawerRef.current?.offsetHeight ?? window.innerHeight * 0.5;
    const threshold = drawerH * 0.3;

    if (Math.abs(delta) < 5) {
      isOpen ? onClose() : onOpen();
    } else if (isOpen) {
      if (delta > threshold || velocity > 0.5) onClose();
    } else {
      if (delta < -threshold || velocity < -0.5) onOpen();
    }

    reset();
  };

  const drawerStyle: CSSProperties = isDragging
    ? {
        transform: isOpen
          ? `translateY(${dragOffset}px)`
          : `translateY(calc(100% - ${PEEK_PX}px + ${dragOffset}px))`,
        transition: "none",
      }
    : {
        transform: isOpen
          ? "translateY(0)"
          : `translateY(calc(100% - ${PEEK_PX}px))`,
        transition: "transform 300ms cubic-bezier(0.2, 0.6, 0.35, 1)",
      };

  return {
    drawerRef,
    isDragging,
    drawerStyle,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: reset,
  };
};

export { useDrawerDrag, PEEK_PX };
