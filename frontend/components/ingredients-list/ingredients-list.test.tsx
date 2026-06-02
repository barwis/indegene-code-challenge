import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { recipeContextFixture } from "@domain/__fixtures__/recipe-context";
import type { components } from "@/types/api";
import { mockUseRecipeContext } from "@test-utils/recipe-context-mock";
import { IngredientsList } from "./ingredients-list";

vi.mock("@context/recipe-context");

type Ingredient = components["schemas"]["Ingredient"];

const makeIngredient = (overrides: Partial<Ingredient> = {}): Ingredient => ({
  name: "test",
  quantity: null,
  unit: null,
  preparation: null,
  category: "other",
  substitutes: [],
  ...overrides,
});

const fiveIngredients: Ingredient[] = [
  makeIngredient({ name: "pasta", quantity: 400, unit: "g", category: "pantry" }),
  makeIngredient({ name: "tomato", quantity: 1, unit: "can", category: "pantry" }),
  makeIngredient({ name: "garlic", quantity: 2, unit: "cloves", category: "produce" }),
  makeIngredient({ name: "oil", quantity: 2, unit: "tbsp", category: "pantry" }),
  makeIngredient({ name: "salt", quantity: null, unit: "to taste", category: "spice" }),
];

const sevenIngredients: Ingredient[] = [
  ...recipeContextFixture.recipe!.ingredients,
  makeIngredient({ name: "parmesan", quantity: 50, unit: "g", category: "dairy" }),
];

describe("IngredientsList", () => {
  describe("rendering all ingredients", () => {
    it("should render every ingredient by name", () => {
      mockUseRecipeContext();
      render(<IngredientsList />);
      expect(screen.getByText("spaghetti")).toBeInTheDocument();
      expect(screen.getByText("garlic")).toBeInTheDocument();
      expect(screen.getByText("fresh basil")).toBeInTheDocument();
    });

    it("should render the Ingredients section heading", () => {
      mockUseRecipeContext();
      render(<IngredientsList />);
      expect(
        screen.getByRole("heading", { name: /ingredients/i }),
      ).toBeInTheDocument();
    });

    it("should show 0/total count when no ingredients are checked", () => {
      mockUseRecipeContext();
      render(<IngredientsList />);
      const total = recipeContextFixture.recipe!.ingredients.length;
      expect(screen.getByText(`(0/${total})`)).toBeInTheDocument();
    });

    it("should update the count when ingredients are checked", () => {
      mockUseRecipeContext({
        state: { ...recipeContextFixture, checked_ingredients: ["garlic", "salt"] },
      });
      render(<IngredientsList />);
      const total = recipeContextFixture.recipe!.ingredients.length;
      expect(screen.getByText(`(2/${total})`)).toBeInTheDocument();
    });
  });

  describe("grouping", () => {
    it("should not show category headers for 6 or fewer ingredients", () => {
      mockUseRecipeContext({
        state: {
          ...recipeContextFixture,
          recipe: { ...recipeContextFixture.recipe!, ingredients: fiveIngredients },
        },
      });
      render(<IngredientsList />);
      expect(screen.queryByText("pantry")).not.toBeInTheDocument();
      expect(screen.queryByText("produce")).not.toBeInTheDocument();
    });

    it("should show category headers when there are more than 6 ingredients", () => {
      mockUseRecipeContext({
        state: {
          ...recipeContextFixture,
          recipe: { ...recipeContextFixture.recipe!, ingredients: sevenIngredients },
        },
      });
      render(<IngredientsList />);
      expect(screen.getByText("pantry")).toBeInTheDocument();
      expect(screen.getByText("produce")).toBeInTheDocument();
      expect(screen.getByText("dairy")).toBeInTheDocument();
    });

    it("should still render all ingredients when grouped", () => {
      mockUseRecipeContext({
        state: {
          ...recipeContextFixture,
          recipe: { ...recipeContextFixture.recipe!, ingredients: sevenIngredients },
        },
      });
      render(<IngredientsList />);
      expect(screen.getByText("spaghetti")).toBeInTheDocument();
      expect(screen.getByText("parmesan")).toBeInTheDocument();
    });
  });

  describe("null guard", () => {
    it("should render nothing when recipe is null", () => {
      mockUseRecipeContext({
        state: { ...recipeContextFixture, recipe: null },
      });
      const { container } = render(<IngredientsList />);
      expect(container).toBeEmptyDOMElement();
    });
  });
});
