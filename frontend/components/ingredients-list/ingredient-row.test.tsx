import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { components } from "@/types/api";
import { IngredientRow } from "./ingredient-row";

type Ingredient = components["schemas"]["Ingredient"];

const makeIngredient = (overrides: Partial<Ingredient> = {}): Ingredient => ({
  name: "garlic",
  quantity: 2,
  unit: "cloves",
  preparation: "thinly sliced",
  category: "produce",
  substitutes: [],
  ...overrides,
});

describe("IngredientRow", () => {
  describe("rendering", () => {
    it("should render the ingredient name", () => {
      render(
        <IngredientRow ingredient={makeIngredient()} isChecked={false} onToggle={vi.fn()} delay={0} />,
      );
      expect(screen.getByText("garlic")).toBeInTheDocument();
    });

    it("should render the formatted quantity and unit", () => {
      render(
        <IngredientRow ingredient={makeIngredient()} isChecked={false} onToggle={vi.fn()} delay={0} />,
      );
      expect(screen.getByText("2 cloves")).toBeInTheDocument();
    });

    it("should render unit-only when quantity is null", () => {
      render(
        <IngredientRow
          ingredient={makeIngredient({ name: "salt", quantity: null, unit: "to taste" })}
          isChecked={false}
          onToggle={vi.fn()}
          delay={0}
        />,
      );
      expect(screen.getByText("to taste")).toBeInTheDocument();
    });

    it("should not render a quantity span when both quantity and unit are null", () => {
      render(
        <IngredientRow
          ingredient={makeIngredient({ name: "basil", quantity: null, unit: null })}
          isChecked={false}
          onToggle={vi.fn()}
          delay={0}
        />,
      );
      expect(screen.queryByRole("generic", { name: /cloves/i })).not.toBeInTheDocument();
      expect(screen.getByText("basil")).toBeInTheDocument();
    });
  });

  describe("aria attributes", () => {
    it("should have aria-label starting with Check when unchecked", () => {
      render(
        <IngredientRow ingredient={makeIngredient()} isChecked={false} onToggle={vi.fn()} delay={0} />,
      );
      expect(screen.getByRole("button", { name: /^check garlic$/i })).toBeInTheDocument();
    });

    it("should have aria-label starting with Uncheck when checked", () => {
      render(
        <IngredientRow ingredient={makeIngredient()} isChecked={true} onToggle={vi.fn()} delay={0} />,
      );
      expect(screen.getByRole("button", { name: /^uncheck garlic$/i })).toBeInTheDocument();
    });

    it("should set aria-pressed to false when unchecked", () => {
      render(
        <IngredientRow ingredient={makeIngredient()} isChecked={false} onToggle={vi.fn()} delay={0} />,
      );
      expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    });

    it("should set aria-pressed to true when checked", () => {
      render(
        <IngredientRow ingredient={makeIngredient()} isChecked={true} onToggle={vi.fn()} delay={0} />,
      );
      expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("checked visual style", () => {
    it("should apply line-through to the name when checked", () => {
      render(
        <IngredientRow ingredient={makeIngredient()} isChecked={true} onToggle={vi.fn()} delay={0} />,
      );
      expect(screen.getByText("garlic")).toHaveClass("line-through");
    });

    it("should not apply line-through when unchecked", () => {
      render(
        <IngredientRow ingredient={makeIngredient()} isChecked={false} onToggle={vi.fn()} delay={0} />,
      );
      expect(screen.getByText("garlic")).not.toHaveClass("line-through");
    });
  });

  describe("interaction", () => {
    it("should call onToggle with the ingredient name when clicked", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <IngredientRow ingredient={makeIngredient()} isChecked={false} onToggle={onToggle} delay={0} />,
      );
      await user.click(screen.getByRole("button"));
      expect(onToggle).toHaveBeenCalledWith("garlic");
    });
  });
});
