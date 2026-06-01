import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { useCopilotChatInternal } from "@copilotkit/react-core";
import * as useRecipeUploadModule from "@hooks/use-recipe-upload";
import renderWithProviders from "@test-utils/render-with-providers";
import Home from "./page";

vi.mock("./hooks/use-recipe-upload");

beforeEach(() => {
  vi.mocked(useCopilotChatInternal).mockReturnValue({
    messages: [],
    sendMessage: vi.fn(),
    isLoading: false,
  } as unknown as ReturnType<typeof useCopilotChatInternal>);
});

const baseHook: ReturnType<typeof useRecipeUploadModule.useRecipeUpload> = {
  state: { current_step: 0, cooking_started: false },
  setState: vi.fn(),
  isLoading: false,
  error: null,
  handleUpload: vi.fn(),
  handleFixture: vi.fn(),
  handleToggleIngredient: vi.fn(),
  handleSetCurrentStep: vi.fn(),
};

describe("Home", () => {
  describe("upload view", () => {
    it("should render without crashing", () => {
      vi.spyOn(useRecipeUploadModule, "useRecipeUpload").mockReturnValue(baseHook);
      renderWithProviders(<Home />);
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should show the upload screen when no recipe is loaded", () => {
      vi.spyOn(useRecipeUploadModule, "useRecipeUpload").mockReturnValue(baseHook);
      renderWithProviders(<Home />);
      expect(
        screen.getByRole("heading", { name: /recipe companion/i }),
      ).toBeInTheDocument();
    });
  });

  describe("recipe view", () => {
    it("should show the recipe title when a recipe is loaded", () => {
      vi.spyOn(useRecipeUploadModule, "useRecipeUpload").mockReturnValue({
        ...baseHook,
        state: {
          ...baseHook.state,
          recipe: {
            title: "Spaghetti al Pomodoro",
            servings: 4,
            difficulty: "easy" as const,
            ingredients: [],
            steps: [],
          },
        },
      });
      renderWithProviders(<Home />);
      expect(
        screen.getByRole("heading", { name: /spaghetti al pomodoro/i }),
      ).toBeInTheDocument();
    });
  });
});
