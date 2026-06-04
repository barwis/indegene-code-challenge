import { render } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import { createElement } from "react";
import { useTextareaAutoResize } from "./use-textarea-auto-resize";

// LINE_HEIGHT=20, PADDING=5 each side → maxHeight = 20*maxRows + 10
const LINE_HEIGHT = 20;
const PADDING = 5;

let mockScrollHeight = 20;

beforeEach(() => {
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    lineHeight: `${LINE_HEIGHT}px`,
    fontSize: "16px",
    paddingTop: `${PADDING}px`,
    paddingBottom: `${PADDING}px`,
  } as unknown as CSSStyleDeclaration);

  Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
    configurable: true,
    get: () => mockScrollHeight,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const TestComponent = ({ value, maxRows }: { value: string; maxRows?: number }) => {
  const textareaRef = useTextareaAutoResize(value, maxRows);
  return createElement("div", null, createElement("textarea", { ref: textareaRef }));
};

const renderTextarea = (value = "", scrollHeight = 20, maxRows?: number) => {
  mockScrollHeight = scrollHeight;
  return render(createElement(TestComponent, { value, maxRows }));
};

describe("useTextareaAutoResize", () => {
  describe("height within maxRows", () => {
    it("sets height to scrollHeight when content fits", () => {
      // maxRows=4 → maxHeight = 20*4+10 = 90. scrollHeight=40 < 90.
      const { container } = renderTextarea("hi", 40);
      expect((container.querySelector("textarea") as HTMLTextAreaElement).style.height).toBe("40px");
    });

    it("sets overflowY to hidden when content fits", () => {
      const { container } = renderTextarea("hi", 40);
      expect((container.querySelector("textarea") as HTMLTextAreaElement).style.overflowY).toBe("hidden");
    });
  });

  describe("height exceeds maxRows", () => {
    it("clamps height to maxHeight when scrollHeight exceeds limit", () => {
      // maxRows=4 → maxHeight=90. scrollHeight=120 > 90.
      const { container } = renderTextarea("lots\nof\ntext\nhere\nextra", 120);
      const maxHeight = LINE_HEIGHT * 4 + PADDING * 2;
      expect((container.querySelector("textarea") as HTMLTextAreaElement).style.height).toBe(`${maxHeight}px`);
    });

    it("sets overflowY to auto when scrollHeight exceeds limit", () => {
      const { container } = renderTextarea("lots\nof\ntext\nhere\nextra", 120);
      expect((container.querySelector("textarea") as HTMLTextAreaElement).style.overflowY).toBe("auto");
    });

    it("respects a custom maxRows value", () => {
      // maxRows=2 → maxHeight = 20*2+10 = 50. scrollHeight=60 > 50.
      const { container } = renderTextarea("line1\nline2\nline3", 60, 2);
      const maxHeight = LINE_HEIGHT * 2 + PADDING * 2;
      expect((container.querySelector("textarea") as HTMLTextAreaElement).style.height).toBe(`${maxHeight}px`);
    });
  });

  describe("on value change", () => {
    it("recalculates height when value changes", () => {
      const { container, rerender } = renderTextarea("hi", 40);
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      expect(textarea.style.height).toBe("40px");

      mockScrollHeight = 60;
      rerender(createElement(TestComponent, { value: "longer text" }));
      expect(textarea.style.height).toBe("60px");
    });
  });

  describe("ResizeObserver", () => {
    let observeSpy: ReturnType<typeof vi.fn>;
    let disconnectSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      observeSpy = vi.fn();
      disconnectSpy = vi.fn();
      vi.stubGlobal(
        "ResizeObserver",
        class {
          observe = observeSpy;
          unobserve = vi.fn();
          disconnect = disconnectSpy;
        },
      );
    });

    afterEach(() => vi.unstubAllGlobals());

    it("observes the parent element on mount", () => {
      const { container } = renderTextarea("text", 24);
      expect(observeSpy).toHaveBeenCalledWith(container.querySelector("div"));
    });

    it("disconnects on unmount", () => {
      const { unmount } = renderTextarea("text", 24);
      unmount();
      expect(disconnectSpy).toHaveBeenCalled();
    });

    it("reconnects when value changes", () => {
      const { rerender } = renderTextarea("a", 24);
      const before = observeSpy.mock.calls.length;
      rerender(createElement(TestComponent, { value: "b" }));
      expect(observeSpy.mock.calls.length).toBeGreaterThan(before);
    });
  });
});
