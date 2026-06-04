import { renderHook, act } from "@testing-library/react";
import { vi, beforeAll, beforeEach, describe, it, expect } from "vitest";
import type { PointerEvent } from "react";
import { useDrawerDrag, PEEK_PX } from "./use-drawer-drag";

// Pin innerHeight so threshold arithmetic is deterministic:
// drawerH = 768 * 0.5 = 384, threshold = 384 * 0.3 = 115.2
const INNER_HEIGHT = 768;
beforeAll(() => {
  Object.defineProperty(window, "innerHeight", { value: INNER_HEIGHT, writable: true });
});

const DRAWER_H = INNER_HEIGHT * 0.5;
const THRESHOLD = DRAWER_H * 0.3;

const ptrDown = (y: number): PointerEvent<HTMLDivElement> =>
  ({
    clientY: y,
    pointerId: 1,
    currentTarget: { setPointerCapture: vi.fn() } as unknown as HTMLDivElement,
  }) as unknown as PointerEvent<HTMLDivElement>;

const ptrMove = (y: number): PointerEvent<HTMLDivElement> =>
  ({ clientY: y }) as unknown as PointerEvent<HTMLDivElement>;

const ptrUp = (y: number): PointerEvent<HTMLDivElement> =>
  ({ clientY: y }) as unknown as PointerEvent<HTMLDivElement>;

const renderDrag = (isOpen: boolean, onOpen = vi.fn(), onClose = vi.fn()) =>
  renderHook(({ open }) => useDrawerDrag({ isOpen: open, onOpen, onClose }), {
    initialProps: { open: isOpen },
  });

describe("useDrawerDrag", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── initial state ──────────────────────────────────────────────────────────

  describe("initial state", () => {
    it("isDragging is false", () => {
      const { result } = renderDrag(false);
      expect(result.current.isDragging).toBe(false);
    });

    it("drawerStyle is translateY(0) with transition when open", () => {
      const { result } = renderDrag(true);
      expect(result.current.drawerStyle.transform).toBe("translateY(0)");
      expect(result.current.drawerStyle.transition).toContain("300ms");
    });

    it("drawerStyle shows peek offset with transition when closed", () => {
      const { result } = renderDrag(false);
      expect(result.current.drawerStyle.transform).toBe(
        `translateY(calc(100% - ${PEEK_PX}px))`
      );
      expect(result.current.drawerStyle.transition).toContain("300ms");
    });
  });

  // ── pointer down ───────────────────────────────────────────────────────────

  describe("onPointerDown", () => {
    it("sets isDragging to true", () => {
      const { result } = renderDrag(true);
      act(() => result.current.onPointerDown(ptrDown(100)));
      expect(result.current.isDragging).toBe(true);
    });

    it("removes transition from drawerStyle", () => {
      const { result } = renderDrag(true);
      act(() => result.current.onPointerDown(ptrDown(100)));
      expect(result.current.drawerStyle.transition).toBe("none");
    });

    it("calls setPointerCapture with the pointerId", () => {
      const { result } = renderDrag(true);
      const e = ptrDown(100);
      act(() => result.current.onPointerDown(e));
      expect((e.currentTarget as HTMLDivElement).setPointerCapture).toHaveBeenCalledWith(1);
    });
  });

  // ── pointer move ───────────────────────────────────────────────────────────

  describe("onPointerMove", () => {
    it("does nothing before pointerDown", () => {
      const { result } = renderDrag(true);
      act(() => result.current.onPointerMove(ptrMove(200)));
      expect(result.current.isDragging).toBe(false);
    });

    it("sets positive dragOffset when open and dragging down", () => {
      const { result } = renderDrag(true);
      act(() => result.current.onPointerDown(ptrDown(100)));
      act(() => result.current.onPointerMove(ptrMove(160)));
      expect(result.current.drawerStyle.transform).toBe("translateY(60px)");
    });

    it("clamps offset to 0 when open and dragging up", () => {
      const { result } = renderDrag(true);
      act(() => result.current.onPointerDown(ptrDown(100)));
      act(() => result.current.onPointerMove(ptrMove(50)));
      expect(result.current.drawerStyle.transform).toBe("translateY(0px)");
    });

    it("sets negative dragOffset when closed and dragging up", () => {
      const { result } = renderDrag(false);
      act(() => result.current.onPointerDown(ptrDown(100)));
      act(() => result.current.onPointerMove(ptrMove(40)));
      expect(result.current.drawerStyle.transform).toBe(
        `translateY(calc(100% - ${PEEK_PX}px + -60px))`
      );
    });

    it("clamps offset to 0 when closed and dragging down", () => {
      const { result } = renderDrag(false);
      act(() => result.current.onPointerDown(ptrDown(100)));
      act(() => result.current.onPointerMove(ptrMove(160)));
      expect(result.current.drawerStyle.transform).toBe(
        `translateY(calc(100% - ${PEEK_PX}px + 0px))`
      );
    });
  });

  // ── pointer up: tap ────────────────────────────────────────────────────────

  describe("onPointerUp — tap (delta < 5px)", () => {
    it("calls onClose when open", () => {
      const onClose = vi.fn();
      const { result } = renderDrag(true, vi.fn(), onClose);
      act(() => result.current.onPointerDown(ptrDown(100)));
      act(() => result.current.onPointerUp(ptrUp(102)));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onOpen when closed", () => {
      const onOpen = vi.fn();
      const { result } = renderDrag(false, onOpen);
      act(() => result.current.onPointerDown(ptrDown(100)));
      act(() => result.current.onPointerUp(ptrUp(103)));
      expect(onOpen).toHaveBeenCalledOnce();
    });

    it("resets isDragging after tap", () => {
      const { result } = renderDrag(true);
      act(() => result.current.onPointerDown(ptrDown(100)));
      act(() => result.current.onPointerUp(ptrUp(101)));
      expect(result.current.isDragging).toBe(false);
    });
  });

  // ── pointer up: threshold ─────────────────────────────────────────────────

  describe("onPointerUp — distance threshold", () => {
    it("calls onClose when open and delta exceeds threshold", () => {
      const onClose = vi.fn();
      const { result } = renderDrag(true, vi.fn(), onClose);
      act(() => result.current.onPointerDown(ptrDown(0)));
      act(() => result.current.onPointerUp(ptrUp(THRESHOLD + 10)));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("does not call onClose when open and delta is below threshold", () => {
      const onClose = vi.fn();
      // Simulate a slow drag so velocity doesn't trigger independently
      vi.spyOn(Date, "now").mockReturnValueOnce(0).mockReturnValueOnce(1000);
      const { result } = renderDrag(true, vi.fn(), onClose);
      act(() => result.current.onPointerDown(ptrDown(0)));
      act(() => result.current.onPointerUp(ptrUp(THRESHOLD - 10)));
      expect(onClose).not.toHaveBeenCalled();
    });

    it("calls onOpen when closed and delta exceeds negative threshold", () => {
      const onOpen = vi.fn();
      const { result } = renderDrag(false, onOpen);
      act(() => result.current.onPointerDown(ptrDown(0)));
      act(() => result.current.onPointerUp(ptrUp(-(THRESHOLD + 10))));
      expect(onOpen).toHaveBeenCalledOnce();
    });

    it("does not call onOpen when closed and delta is below negative threshold", () => {
      const onOpen = vi.fn();
      // Simulate a slow drag so velocity doesn't trigger independently
      vi.spyOn(Date, "now").mockReturnValueOnce(0).mockReturnValueOnce(1000);
      const { result } = renderDrag(false, onOpen);
      act(() => result.current.onPointerDown(ptrDown(0)));
      act(() => result.current.onPointerUp(ptrUp(-(THRESHOLD - 10))));
      expect(onOpen).not.toHaveBeenCalled();
    });

    it("resets isDragging after snap decision", () => {
      const { result } = renderDrag(true);
      act(() => result.current.onPointerDown(ptrDown(0)));
      act(() => result.current.onPointerUp(ptrUp(THRESHOLD + 10)));
      expect(result.current.isDragging).toBe(false);
    });
  });

  // ── pointer up: velocity ───────────────────────────────────────────────────

  describe("onPointerUp — velocity threshold", () => {
    it("calls onClose when open and velocity exceeds 0.5 px/ms", () => {
      const onClose = vi.fn();
      vi.spyOn(Date, "now").mockReturnValueOnce(0).mockReturnValueOnce(100);
      const { result } = renderDrag(true, vi.fn(), onClose);
      act(() => result.current.onPointerDown(ptrDown(0)));
      // delta=60, elapsed=100ms → velocity=0.6 > 0.5
      act(() => result.current.onPointerUp(ptrUp(60)));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onOpen when closed and velocity exceeds -0.5 px/ms", () => {
      const onOpen = vi.fn();
      vi.spyOn(Date, "now").mockReturnValueOnce(0).mockReturnValueOnce(100);
      const { result } = renderDrag(false, onOpen);
      act(() => result.current.onPointerDown(ptrDown(0)));
      // delta=-60, elapsed=100ms → velocity=-0.6 < -0.5
      act(() => result.current.onPointerUp(ptrUp(-60)));
      expect(onOpen).toHaveBeenCalledOnce();
    });
  });

  // ── pointer cancel ─────────────────────────────────────────────────────────

  describe("onPointerCancel", () => {
    it("resets isDragging to false", () => {
      const { result } = renderDrag(true);
      act(() => result.current.onPointerDown(ptrDown(100)));
      act(() => result.current.onPointerMove(ptrMove(200)));
      act(() => result.current.onPointerCancel());
      expect(result.current.isDragging).toBe(false);
    });

    it("resets drawerStyle to non-dragging state", () => {
      const { result } = renderDrag(true);
      act(() => result.current.onPointerDown(ptrDown(100)));
      act(() => result.current.onPointerMove(ptrMove(200)));
      act(() => result.current.onPointerCancel());
      expect(result.current.drawerStyle.transition).toContain("300ms");
    });

    it("does not call onOpen or onClose", () => {
      const onOpen = vi.fn();
      const onClose = vi.fn();
      const { result } = renderDrag(true, onOpen, onClose);
      act(() => result.current.onPointerDown(ptrDown(100)));
      act(() => result.current.onPointerCancel());
      expect(onOpen).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
