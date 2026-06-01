import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import type { components } from "@/types/api";
import { IngredientsList } from "./ingredients-list";

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

const fixtureIngredients: Ingredient[] = [
  makeIngredient({ name: "spaghetti", quantity: 400, unit: "g", category: "pantry" }),
  makeIngredient({ name: "canned whole tomatoes", quantity: 400, unit: "g", preparation: "crushed by hand", category: "pantry" }),
  makeIngredient({ name: "garlic", quantity: 2, unit: "cloves", preparation: "thinly sliced", category: "produce" }),
  makeIngredient({ name: "extra virgin olive oil", quantity: 4, unit: "tbsp", category: "pantry" }),
  makeIngredient({ name: "fresh basil", preparation: "torn", category: "produce" }),
  makeIngredient({ name: "salt", unit: "to taste", category: "spice" }),
];

const sevenIngredients: Ingredient[] = [
  ...fixtureIngredients,
  makeIngredient({ name: "parmesan", quantity: 50, unit: "g", category: "dairy" }),
];

const StatefulWrapper = ({
  ingredients,
  initial = [],
}: {
  ingredients: Ingredient[];
  initial?: string[];
}) => {
  const [checked, setChecked] = useState<string[]>(initial);
  return (
    <IngredientsList
      ingredients={ingredients}
      checkedIngredients={checked}
      onToggle={(name) =>
        setChecked((prev) =>
          prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
        )
      }
    />
  );
};

describe("IngredientsList", () => {
  describe("rendering all ingredients", () => {
    it("should render every ingredient by name", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(screen.getByText("spaghetti")).toBeInTheDocument();
      expect(screen.getByText("garlic")).toBeInTheDocument();
      expect(screen.getByText("fresh basil")).toBeInTheDocument();
      expect(screen.getByText("salt")).toBeInTheDocument();
    });

    it("should render the Ingredients section heading", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(
        screen.getByRole("heading", { name: /ingredients/i }),
      ).toBeInTheDocument();
    });

    it("should show 0/total count when no ingredients are checked", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(screen.getByText(`(0/${fixtureIngredients.length})`)).toBeInTheDocument();
    });

    it("should update the count when ingredients are checked", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={["garlic", "salt"]}
          onToggle={() => {}}
        />,
      );
      expect(screen.getByText(`(2/${fixtureIngredients.length})`)).toBeInTheDocument();
    });
  });

  describe("ingredient row content", () => {
    it("should show formatted quantity and unit for each ingredient", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(screen.getAllByText("400 g")).toHaveLength(2);
      expect(screen.getByText("2 cloves")).toBeInTheDocument();
      expect(screen.getByText("4 tbsp")).toBeInTheDocument();
    });

    it("should show unit-only when quantity is null", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(screen.getByText("to taste")).toBeInTheDocument();
    });

    it("should not show the preparation note", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(screen.queryByText("crushed by hand")).not.toBeInTheDocument();
      expect(screen.queryByText("thinly sliced")).not.toBeInTheDocument();
    });
  });

  describe("check circle state", () => {
    it("should show unchecked aria-label for unchecked ingredient", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(
        screen.getByRole("button", { name: /^check garlic$/i }),
      ).toBeInTheDocument();
    });

    it("should show checked aria-label for ingredient in checkedIngredients", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={["garlic"]}
          onToggle={() => {}}
        />,
      );
      expect(
        screen.getByRole("button", { name: /^uncheck garlic$/i }),
      ).toBeInTheDocument();
    });

    it("should mark checked button as pressed", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={["garlic"]}
          onToggle={() => {}}
        />,
      );
      expect(
        screen.getByRole("button", { name: /uncheck garlic/i }),
      ).toHaveAttribute("aria-pressed", "true");
    });

    it("should mark unchecked button as not pressed", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(
        screen.getByRole("button", { name: /check garlic/i }),
      ).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("checked visual style", () => {
    it("should apply line-through to checked ingredient name", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={["garlic"]}
          onToggle={() => {}}
        />,
      );
      expect(screen.getByText("garlic")).toHaveClass("line-through");
    });

    it("should not apply line-through to unchecked ingredient name", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(screen.getByText("garlic")).not.toHaveClass("line-through");
    });
  });

  describe("toggle interaction", () => {
    it("should show ingredient as checked after tapping its check circle", async () => {
      const user = userEvent.setup();
      render(<StatefulWrapper ingredients={fixtureIngredients} />);
      await user.click(screen.getByRole("button", { name: /^check garlic$/i }));
      expect(
        screen.getByRole("button", { name: /^uncheck garlic$/i }),
      ).toBeInTheDocument();
    });

    it("should show ingredient as unchecked after tapping its check circle again", async () => {
      const user = userEvent.setup();
      render(
        <StatefulWrapper ingredients={fixtureIngredients} initial={["garlic"]} />,
      );
      await user.click(
        screen.getByRole("button", { name: /^uncheck garlic$/i }),
      );
      expect(
        screen.getByRole("button", { name: /^check garlic$/i }),
      ).toBeInTheDocument();
    });

    it("should apply line-through after tapping check circle", async () => {
      const user = userEvent.setup();
      render(<StatefulWrapper ingredients={fixtureIngredients} />);
      await user.click(screen.getByRole("button", { name: /^check garlic$/i }));
      expect(screen.getByText("garlic")).toHaveClass("line-through");
    });

    it("should remove line-through after unchecking", async () => {
      const user = userEvent.setup();
      render(
        <StatefulWrapper ingredients={fixtureIngredients} initial={["garlic"]} />,
      );
      await user.click(
        screen.getByRole("button", { name: /^uncheck garlic$/i }),
      );
      expect(screen.getByText("garlic")).not.toHaveClass("line-through");
    });
  });

  describe("grouping", () => {
    it("should not show category headers for 6 or fewer ingredients", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(screen.queryByText("pantry")).not.toBeInTheDocument();
      expect(screen.queryByText("produce")).not.toBeInTheDocument();
    });

    it("should show category headers when there are more than 6 ingredients", () => {
      render(
        <IngredientsList
          ingredients={sevenIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(screen.getByText("pantry")).toBeInTheDocument();
      expect(screen.getByText("produce")).toBeInTheDocument();
      expect(screen.getByText("dairy")).toBeInTheDocument();
    });

    it("should still render all ingredients when grouped", () => {
      render(
        <IngredientsList
          ingredients={sevenIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      expect(screen.getByText("spaghetti")).toBeInTheDocument();
      expect(screen.getByText("parmesan")).toBeInTheDocument();
    });
  });

  describe("touch target", () => {
    it("should give each ingredient row a 50px minimum height", () => {
      render(
        <IngredientsList
          ingredients={fixtureIngredients}
          checkedIngredients={[]}
          onToggle={() => {}}
        />,
      );
      const rows = screen.getAllByRole("listitem");
      rows.forEach((row) => expect(row).toHaveClass("min-h-[50px]"));
    });
  });
});
