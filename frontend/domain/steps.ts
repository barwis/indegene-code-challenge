import type { components } from "@/types/api";

type RecipeStep = components["schemas"]["RecipeStep"];

export type StepState = "done" | "active" | "upcoming";

export const getStepState = (index: number, currentStep: number): StepState => {
  if (index < currentStep) return "done";
  if (index === currentStep) return "active";
  return "upcoming";
};

export const getStepTips = (step: RecipeStep): string[] =>
  step.tips ?? [];

export const hasAttentionWarning = (step: RecipeStep): boolean =>
  step.requires_attention;
