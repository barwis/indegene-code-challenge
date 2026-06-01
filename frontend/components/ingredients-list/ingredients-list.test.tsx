import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { recipeContextFixture } from "@domain/__fixtures__/recipe-context";
import type { components } from "@/types/api";
import * as recipeContextModule from "@context/recipe-context";
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

const sevenIngredients: Ingredient[] = [
  ...recipeContextFixture.recipe!.ingredients,
  makeIngredient({ name: "parmesan", quantity: 50, unit: "g", category: "dairy" }),
];

const setupStatefulMock = (initialChecked: string[] = []) => {
  const checked = { current: [...initialChecked] };
  vi.spyOn(recipeContextModule, "useRecipeContext").mockImplementation(() => ({
    state: {
      ...recipeContextFixture,
      checked_ingredients: checked.current,
    },
    setState: vi.fn(),
    isLoading: false,
    error: null,
    handleUpload: vi.fn(),
    handleFixture: vi.fn(),
    handleSetCurrentStep: vi.fn(),
    handleToggleIngredient: (name: string) => {
      checked.current = checked.current.includes(name)
        ? checked.current.filter((n) => n !== name)
        : [...checked.current, name];
    },
    messages: [],
    isChatLoading: false,
    sendMessage: vi.fn(),
  }));
  return checked;
};

describe("IngredientsList", () => {
  describe("rendering all ingredients", () => {
    it("should render every ingredient by name", () => {
      mockUseRecipeContext();
      render(<IngredientsList />);
      expect(screen.getByText("spaghetti")).toBeInTheDocument();
      expect(screen.getByText("garlic")).toBeInTheDocument();
      expect(screen.getByText("fresh basil")).toBeInTheDocument();
      expect(screen.getByText("salt")).toBeInTheDocument();
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

  describe("ingredient row content", () => {
    it("should show formatted quantity and unit for each ingredient", () => {
      mockUseRecipeContext();
      render(<IngredientsList />);
      expect(screen.getAllByText("400 g")).toHaveLength(2);
      expect(screen.getByText("2 cloves")).toBeInTheDocument();
      expect(screen.getByText("4 tbsp")).toBeInTheDocument();
    });

    it("should show unit-only when quantity is null", () => {
      mockUseRecipeContext();
      render(<IngredientsList />);
      expect(screen.getByText("to taste")).toBeInTheDocument();
    });

    it("should not show the preparation note", () => {
      mockUseRecipeContext();
      render(<IngredientsList />);
      expect(screen.queryByText("crushed by hand")).not.toBeInTheDocument();
      expect(screen.queryByText("thinly sliced")).not.toBeInTheDocument();
    });
  });

  describe("check circle state", () => {
    it("should show unchecked aria-label for unchecked ingredient", () => {
      mockUseRecipeContext();
      render(<IngredientsList />);
      expect(
        screen.getByRole("button", { name: /^check garlic$/i }),
      ).toBeInTheDocument();
    });

    it("should show checked aria-label for ingredient in checkedIngredients", () => {
      mockUseRecipeContext({
        state: { ...recipeContextFixture, checked_ingredients: ["garlic"] },
      });
      render(<IngredientsList />);
      expect(
        screen.getByRole("button", { name: /^uncheck garlic$/i }),
      ).toBeInTheDocument();
    });

    it("should mark checked button as pressed", () => {
      mockUseRecipeContext({
        state: { ...recipeContextFixture, checked_ingredients: ["garlic"] },
      });
      render(<IngredientsList />);
      expect(
        screen.getByRole("button", { name: /uncheck garlic/i }),
      ).toHaveAttribute("aria-pressed", "true");
    });

    it("should mark unchecked button as not pressed", () => {
      mockUseRecipeContext();
      render(<IngredientsList />);
      expect(
        screen.getByRole("button", { name: /check garlic/i }),
      ).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("checked visual style", () => {
    it("should apply line-through to checked ingredient name", () => {
      mockUseRecipeContext({
        state: { ...recipeContextFixture, checked_ingredients: ["garlic"] },
      });
      render(<IngredientsList />);
      expect(screen.getByText("garlic")).toHaveClass("line-through");
    });

    it("should not apply line-through to unchecked ingredient name", () => {
      mockUseRecipeContext();
      render(<IngredientsList />);
      expect(screen.getByText("garlic")).not.toHaveClass("line-through");
    });
  });

  describe("toggle interaction", () => {
    it("should show ingredient as checked after tapping its check circle", async () => {
      const user = userEvent.setup();
      setupStatefulMock();
      const { rerender } = render(<IngredientsList />);
      await user.click(screen.getByRole("button", { name: /^check garlic$/i }));
      rerender(<IngredientsList />);
      expect(
        screen.getByRole("button", { name: /^uncheck garlic$/i }),
      ).toBeInTheDocument();
    });

    it("should show ingredient as unchecked after tapping its check circle again", async () => {
      const user = userEvent.setup();
      setupStatefulMock(["garlic"]);
      const { rerender } = render(<IngredientsList />);
      await user.click(
        screen.getByRole("button", { name: /^uncheck garlic$/i }),
      );
      rerender(<IngredientsList />);
      expect(
        screen.getByRole("button", { name: /^check garlic$/i }),
      ).toBeInTheDocument();
    });

    it("should apply line-through after tapping check circle", async () => {
      const user = userEvent.setup();
      setupStatefulMock();
      const { rerender } = render(<IngredientsList />);
      await user.click(screen.getByRole("button", { name: /^check garlic$/i }));
      rerender(<IngredientsList />);
      expect(screen.getByText("garlic")).toHaveClass("line-through");
    });

    it("should remove line-through after unchecking", async () => {
      const user = userEvent.setup();
      setupStatefulMock(["garlic"]);
      const { rerender } = render(<IngredientsList />);
      await user.click(
        screen.getByRole("button", { name: /^uncheck garlic$/i }),
      );
      rerender(<IngredientsList />);
      expect(screen.getByText("garlic")).not.toHaveClass("line-through");
    });
  });

  describe("grouping", () => {
    it("should not show category headers for 6 or fewer ingredients", () => {
      mockUseRecipeContext();
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

  describe("touch target", () => {
    it("should give each ingredient row a 50px minimum height", () => {
      mockUseRecipeContext();
      render(<IngredientsList />);
      const rows = screen.getAllByRole("listitem");
      rows.forEach((row) => expect(row).toHaveClass("min-h-[50px]"));
    });
  });
});
