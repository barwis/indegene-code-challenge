import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { PropsWithChildren } from "react";
import { mockUseRecipeContext } from "@test-utils/recipe-context-mock";
import { recipeContextFixture } from "@domain/__fixtures__/recipe-context";
import { HomeContent } from "./home-content";

vi.mock("@context/recipe-context");
vi.mock("@components", () => ({
  RecipeHeader: () => <div data-testid="recipe-header" />,
  Tabs: ({ children }: PropsWithChildren) => <div>{children}</div>,
  Tab: ({ children }: PropsWithChildren) => <div>{children}</div>,
  IngredientsList: () => <div data-testid="ingredients-list" />,
  StepsList: () => <div data-testid="steps-list" />,
  UploadRecipe: () => <div data-testid="upload-recipe" />,
  ChatPanel: () => <div data-testid="chat-panel" />,
  ChatDrawer: () => <div data-testid="chat-drawer" />,
}));

describe("HomeContent", () => {
  describe("when no recipe is loaded", () => {
    it("should render UploadRecipe", () => {
      mockUseRecipeContext({
        state: { ...recipeContextFixture, recipe: null },
      });
      render(<HomeContent />);
      expect(screen.getByTestId("upload-recipe")).toBeInTheDocument();
    });

    it("should not render the recipe layout", () => {
      mockUseRecipeContext({
        state: { ...recipeContextFixture, recipe: null },
      });
      render(<HomeContent />);
      expect(screen.queryByTestId("recipe-header")).not.toBeInTheDocument();
    });
  });

  describe("when a recipe is loaded", () => {
    it("should render RecipeHeader", () => {
      mockUseRecipeContext();
      render(<HomeContent />);
      expect(screen.getByTestId("recipe-header")).toBeInTheDocument();
    });

    it("should render IngredientsList", () => {
      mockUseRecipeContext();
      render(<HomeContent />);
      expect(screen.getByTestId("ingredients-list")).toBeInTheDocument();
    });

    it("should render StepsList", () => {
      mockUseRecipeContext();
      render(<HomeContent />);
      expect(screen.getByTestId("steps-list")).toBeInTheDocument();
    });

    it("should render ChatPanel", () => {
      mockUseRecipeContext();
      render(<HomeContent />);
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    });

    it("should not render UploadRecipe when a recipe is loaded", () => {
      mockUseRecipeContext();
      render(<HomeContent />);
      expect(screen.queryByTestId("upload-recipe")).not.toBeInTheDocument();
    });
  });
});
