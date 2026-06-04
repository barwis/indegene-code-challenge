import "@testing-library/jest-dom";
import { vi } from "vitest";

Element.prototype.scrollIntoView = vi.fn();

global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};
