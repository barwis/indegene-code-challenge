import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { recipeContextFixture } from "@/domain/__fixtures__/recipe-context";
import * as useRecipeUploadModule from "@/app/hooks/use-recipe-upload";
import { RecipeTabs } from "./recipe-tabs";

vi.mock("@/app/hooks/use-recipe-upload");

const recipe = recipeContextFixture.recipe!;

const mockHook = (
  overrides: Partial<
    ReturnType<typeof useRecipeUploadModule.useRecipeUpload>
  > = {},
) => {
  vi.spyOn(useRecipeUploadModule, "useRecipeUpload").mockReturnValue({
    state: recipeContextFixture,
    setState: vi.fn(),
    isLoading: false,
    error: null,
    handleUpload: vi.fn(),
    handleFixture: vi.fn(),
    handleToggleIngredient: vi.fn(),
    ...overrides,
  });
};

describe("RecipeTabs", () => {
  describe("tab structure", () => {
    it("should render the Ingredients and Steps tabs", () => {
      mockHook();
      render(<RecipeTabs recipe={recipe} checkedIngredients={[]} />);
      expect(
        screen.getByRole("tab", { name: "Ingredients" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Steps" })).toBeInTheDocument();
    });

    it("should have Ingredients tab selected by default", () => {
      mockHook();
      render(<RecipeTabs recipe={recipe} checkedIngredients={[]} />);
      expect(screen.getByRole("tab", { name: "Ingredients" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByRole("tab", { name: "Steps" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("should show the ingredients panel by default", () => {
      mockHook();
      render(<RecipeTabs recipe={recipe} checkedIngredients={[]} />);
      expect(
        screen.getByRole("tabpanel", { name: "Ingredients" }),
      ).not.toHaveAttribute("hidden");
    });
  });

  describe("tab switching", () => {
    it("should mark Steps tab as selected when clicked", async () => {
      mockHook();
      const user = userEvent.setup();
      render(<RecipeTabs recipe={recipe} checkedIngredients={[]} />);
      await user.click(screen.getByRole("tab", { name: "Steps" }));
      expect(screen.getByRole("tab", { name: "Steps" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByRole("tab", { name: "Ingredients" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("should hide ingredient content when Steps tab is active", async () => {
      mockHook();
      const user = userEvent.setup();
      render(<RecipeTabs recipe={recipe} checkedIngredients={[]} />);
      await user.click(screen.getByRole("tab", { name: "Steps" }));
      expect(screen.getByText("spaghetti")).not.toBeVisible();
    });

    it("should return to the ingredients panel when Ingredients tab is clicked again", async () => {
      mockHook();
      const user = userEvent.setup();
      render(<RecipeTabs recipe={recipe} checkedIngredients={[]} />);
      await user.click(screen.getByRole("tab", { name: "Steps" }));
      await user.click(screen.getByRole("tab", { name: "Ingredients" }));
      expect(
        screen.getByRole("tabpanel", { name: "Ingredients" }),
      ).not.toHaveAttribute("hidden");
    });
  });

  describe("ingredients panel content", () => {
    it("should render ingredient names in the ingredients panel", () => {
      mockHook();
      render(<RecipeTabs recipe={recipe} checkedIngredients={[]} />);
      expect(screen.getByText("spaghetti")).toBeInTheDocument();
      expect(screen.getByText("garlic")).toBeInTheDocument();
    });
  });

  describe("touch targets", () => {
    it("should give each tab a 50px minimum height", () => {
      mockHook();
      render(<RecipeTabs recipe={recipe} checkedIngredients={[]} />);
      const tabs = screen.getAllByRole("tab");
      tabs.forEach((tab) => expect(tab).toHaveClass("min-h-[50px]"));
    });
  });
});
