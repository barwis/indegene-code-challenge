import { vi } from "vitest";
import * as useRecipeUploadModule from "@hooks/use-recipe-upload";
import { recipeContextFixture } from "@domain/__fixtures__/recipe-context";

export const mockUseRecipeUpload = (
  overrides: Partial<ReturnType<typeof useRecipeUploadModule.useRecipeUpload>> = {},
) => {
  vi.spyOn(useRecipeUploadModule, "useRecipeUpload").mockReturnValue({
    state: recipeContextFixture,
    setState: vi.fn(),
    isLoading: false,
    error: null,
    handleUpload: vi.fn(),
    handleFixture: vi.fn(),
    handleToggleIngredient: vi.fn(),
    handleSetCurrentStep: vi.fn(),
    ...overrides,
  });
};
