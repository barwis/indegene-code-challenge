import type { components } from "@/types/api";
import {
  formatIngredientQuantity,
  groupIngredientsByCategory,
  toggleCheckedIngredient,
} from "./ingredients";

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

describe("formatIngredientQuantity", () => {
  it("should format quantity and unit together", () => {
    expect(
      formatIngredientQuantity(makeIngredient({ quantity: 400, unit: "g" })),
    ).toBe("400 g");
  });

  it("should return only quantity string when unit is null", () => {
    expect(
      formatIngredientQuantity(makeIngredient({ quantity: 2, unit: null })),
    ).toBe("2");
  });

  it("should return only unit when quantity is null", () => {
    expect(
      formatIngredientQuantity(
        makeIngredient({ quantity: null, unit: "to taste" }),
      ),
    ).toBe("to taste");
  });

  it("should return empty string when both quantity and unit are null", () => {
    expect(
      formatIngredientQuantity(makeIngredient({ quantity: null, unit: null })),
    ).toBe("");
  });

  it("should handle decimal quantities", () => {
    expect(
      formatIngredientQuantity(makeIngredient({ quantity: 1.5, unit: "tsp" })),
    ).toBe("1.5 tsp");
  });
});

describe("toggleCheckedIngredient", () => {
  it("should add ingredient when not in list", () => {
    expect(toggleCheckedIngredient([], "garlic")).toEqual(["garlic"]);
  });

  it("should remove ingredient when already in list", () => {
    expect(toggleCheckedIngredient(["garlic", "onion"], "garlic")).toEqual([
      "onion",
    ]);
  });

  it("should preserve other items when removing", () => {
    expect(
      toggleCheckedIngredient(["garlic", "onion", "salt"], "onion"),
    ).toEqual(["garlic", "salt"]);
  });

  it("should not mutate the original list when adding", () => {
    const list = ["garlic"];
    const result = toggleCheckedIngredient(list, "onion");
    expect(list).toEqual(["garlic"]);
    expect(result).toEqual(["garlic", "onion"]);
  });

  it("should not mutate the original list when removing", () => {
    const list = ["garlic", "onion"];
    const result = toggleCheckedIngredient(list, "garlic");
    expect(list).toEqual(["garlic", "onion"]);
    expect(result).toEqual(["onion"]);
  });
});

describe("groupIngredientsByCategory", () => {
  const produce = makeIngredient({ name: "garlic", category: "produce" });
  const protein = makeIngredient({ name: "chicken", category: "protein" });
  const dairy = makeIngredient({ name: "butter", category: "dairy" });
  const pantry = makeIngredient({ name: "pasta", category: "pantry" });
  const spice = makeIngredient({ name: "salt", category: "spice" });
  const other = makeIngredient({ name: "misc", category: "other" });

  it("should group ingredients by their category", () => {
    const groups = groupIngredientsByCategory([pantry, produce]);
    expect(groups).toHaveLength(2);
    expect(groups[0].category).toBe("produce");
    expect(groups[1].category).toBe("pantry");
  });

  it("should follow CATEGORY_ORDER regardless of input order", () => {
    const groups = groupIngredientsByCategory([spice, protein, produce]);
    expect(groups.map((g) => g.category)).toEqual([
      "produce",
      "protein",
      "spice",
    ]);
  });

  it("should omit categories with no ingredients", () => {
    const groups = groupIngredientsByCategory([produce]);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe("produce");
  });

  it("should include all items within a category", () => {
    const onion = makeIngredient({ name: "onion", category: "produce" });
    const groups = groupIngredientsByCategory([produce, onion]);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[0].items.map((i) => i.name)).toEqual(["garlic", "onion"]);
  });

  it("should handle all six categories at once", () => {
    const groups = groupIngredientsByCategory([
      other,
      spice,
      pantry,
      dairy,
      protein,
      produce,
    ]);
    expect(groups.map((g) => g.category)).toEqual([
      "produce",
      "protein",
      "dairy",
      "pantry",
      "spice",
      "other",
    ]);
  });

  it("should bucket ingredients with unrecognised category into other", () => {
    const unknown = makeIngredient({
      name: "mystery",
      category: "condiment" as never,
    });
    const groups = groupIngredientsByCategory([produce, unknown]);
    expect(groups.map((g) => g.category)).toEqual(["produce", "other"]);
    expect(groups.find((g) => g.category === "other")?.items[0].name).toBe(
      "mystery",
    );
  });
});
