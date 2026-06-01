import { vi } from "vitest";
import * as recipeContextModule from "@context/recipe-context";
import { recipeContextFixture } from "@domain/__fixtures__/recipe-context";

export const mockUseRecipeContext = (
  overrides: Partial<ReturnType<typeof recipeContextModule.useRecipeContext>> = {},
) => {
  vi.spyOn(recipeContextModule, "useRecipeContext").mockReturnValue({
    state: recipeContextFixture,
    setState: vi.fn(),
    isLoading: false,
    error: null,
    handleUpload: vi.fn(),
    handleFixture: vi.fn(),
    handleToggleIngredient: vi.fn(),
    handleSetCurrentStep: vi.fn(),
    messages: [],
    isChatLoading: false,
    sendMessage: vi.fn(),
    toast: null,
    setToast: vi.fn(),
    resetUpload: vi.fn(),
    retryLastMessage: vi.fn(),
    ...overrides,
  });
};
