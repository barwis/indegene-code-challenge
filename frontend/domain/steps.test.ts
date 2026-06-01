// Using vitest with React Testing Library per project test conventions (CONTEXT.md)
import { describe, it, expect } from "vitest";
import { getStepState, getStepTips, hasAttentionWarning } from "./steps";
import type { components } from "@/types/api";

type RecipeStep = components["schemas"]["RecipeStep"];

const makeStep = (overrides: Partial<RecipeStep> = {}): RecipeStep => ({
  step_number: 1,
  instruction: "Test instruction",
  requires_attention: false,
  ...overrides,
});

describe("getStepState", () => {
  it("should return done when index is before current step", () => {
    expect(getStepState(0, 2)).toBe("done");
    expect(getStepState(1, 2)).toBe("done");
  });

  it("should return active when index equals current step", () => {
    expect(getStepState(0, 0)).toBe("active");
    expect(getStepState(3, 3)).toBe("active");
  });

  it("should return upcoming when index is after current step", () => {
    expect(getStepState(1, 0)).toBe("upcoming");
    expect(getStepState(4, 2)).toBe("upcoming");
  });
});

describe("getStepTips", () => {
  it("should return tips array when present", () => {
    const step = makeStep({ tips: ["tip one", "tip two"] });
    expect(getStepTips(step)).toEqual(["tip one", "tip two"]);
  });

  it("should return empty array when tips is undefined", () => {
    const step = makeStep({ tips: undefined });
    expect(getStepTips(step)).toEqual([]);
  });

  it("should return empty array when tips is empty", () => {
    const step = makeStep({ tips: [] });
    expect(getStepTips(step)).toEqual([]);
  });
});

describe("hasAttentionWarning", () => {
  it("should return true when requires_attention is true", () => {
    const step = makeStep({ requires_attention: true });
    expect(hasAttentionWarning(step)).toBe(true);
  });

  it("should return false when requires_attention is false", () => {
    const step = makeStep({ requires_attention: false });
    expect(hasAttentionWarning(step)).toBe(false);
  });
});
