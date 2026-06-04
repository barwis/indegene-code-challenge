import type { components } from "@/types/api";

type Ingredient = components["schemas"]["Ingredient"];

type IngredientGroup = {
  category: string;
  items: Ingredient[];
};

const CATEGORY_ORDER = [
  "produce",
  "protein",
  "dairy",
  "pantry",
  "spice",
  "other",
] as const;

export const formatIngredientQuantity = (ingredient: Ingredient): string => {
  const parts: string[] = [];
  if (ingredient.quantity != null) parts.push(String(ingredient.quantity));
  if (ingredient.unit) parts.push(ingredient.unit);
  return parts.join(" ");
};

export const toggleCheckedIngredient = (
  checkedIngredients: string[],
  name: string,
): string[] =>
  checkedIngredients.includes(name)
    ? checkedIngredients.filter((n) => n !== name)
    : [...checkedIngredients, name];

export const groupIngredientsByCategory = (
  ingredients: Ingredient[],
): IngredientGroup[] => {
  const map = new Map<string, Ingredient[]>();
  for (const ingredient of ingredients) {
    const cat = (CATEGORY_ORDER as readonly string[]).includes(ingredient.category)
      ? ingredient.category
      : "other";
    const existing = map.get(cat);
    if (existing) {
      existing.push(ingredient);
    } else {
      map.set(cat, [ingredient]);
    }
  }
  return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
    category: cat,
    items: map.get(cat)!,
  }));
};
