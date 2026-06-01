import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { mockUseRecipeContext } from "@test-utils/recipe-context-mock";
import Home from "./page";

vi.mock("@context/recipe-context", () => ({
  RecipeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRecipeContext: vi.fn(),
}));

describe("Home", () => {
  describe("upload view", () => {
    it("should render without crashing", () => {
      mockUseRecipeContext({ state: { current_step: 0, cooking_started: false } });
      render(<Home />);
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should show the upload screen when no recipe is loaded", () => {
      mockUseRecipeContext({ state: { current_step: 0, cooking_started: false } });
      render(<Home />);
      expect(
        screen.getByRole("heading", { name: /recipe companion/i }),
      ).toBeInTheDocument();
    });
  });

  describe("recipe view", () => {
    it("should show the recipe title when a recipe is loaded", () => {
      mockUseRecipeContext({
        state: {
          current_step: 0,
          cooking_started: false,
          recipe: {
            title: "Spaghetti al Pomodoro",
            servings: 4,
            difficulty: "easy" as const,
            ingredients: [],
            steps: [],
          },
        },
      });
      render(<Home />);
      expect(
        screen.getByRole("heading", { name: /spaghetti al pomodoro/i }),
      ).toBeInTheDocument();
    });
  });
});
