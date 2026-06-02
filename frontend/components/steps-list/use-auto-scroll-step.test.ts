import { render } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import { createElement } from "react";
import { useAutoScrollStep } from "./use-auto-scroll-step";

const scrollMock = vi.mocked(Element.prototype.scrollIntoView);

const TestComponent = ({ isActive }: { isActive: boolean }) => {
  const ref = useAutoScrollStep(isActive);
  return createElement("button", { ref }, "step");
};

const renderStep = (isActive: boolean) =>
  render(createElement(TestComponent, { isActive }));

beforeEach(() => {
  scrollMock.mockClear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});

describe("useAutoScrollStep", () => {
  describe("initial render", () => {
    it("should not scroll when isActive is true on mount", () => {
      renderStep(true);
      expect(scrollMock).not.toHaveBeenCalled();
    });

    it("should not scroll when isActive is false on mount", () => {
      renderStep(false);
      expect(scrollMock).not.toHaveBeenCalled();
    });
  });

  describe("subsequent changes", () => {
    it("should scroll when isActive transitions from false to true", () => {
      const { rerender } = renderStep(false);
      rerender(createElement(TestComponent, { isActive: true }));
      expect(scrollMock).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });
    });

    it("should not scroll when isActive transitions from true to false", () => {
      const { rerender } = renderStep(true);
      rerender(createElement(TestComponent, { isActive: false }));
      expect(scrollMock).not.toHaveBeenCalled();
    });

    it("should scroll again on each subsequent activation", () => {
      const { rerender } = renderStep(false);
      rerender(createElement(TestComponent, { isActive: true }));
      rerender(createElement(TestComponent, { isActive: false }));
      scrollMock.mockClear();
      rerender(createElement(TestComponent, { isActive: true }));
      expect(scrollMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("prefers-reduced-motion", () => {
    it("should use behavior instant when prefers-reduced-motion matches", () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });
      const { rerender } = renderStep(false);
      rerender(createElement(TestComponent, { isActive: true }));
      expect(scrollMock).toHaveBeenCalledWith({
        behavior: "instant",
        block: "center",
      });
    });

    it("should use behavior smooth when prefers-reduced-motion does not match", () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      const { rerender } = renderStep(false);
      rerender(createElement(TestComponent, { isActive: true }));
      expect(scrollMock).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });
    });
  });
});
