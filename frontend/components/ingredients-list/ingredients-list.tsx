import type { components } from "@/types/api";
import { Check } from "lucide-react";
import { useRecipeContext } from "@context/recipe-context";
import {
  formatIngredientQuantity,
  groupIngredientsByCategory,
} from "@domain/ingredients";

type Ingredient = components["schemas"]["Ingredient"];

type IngredientRowProps = {
  ingredient: Ingredient;
  isChecked: boolean;
  onToggle: (name: string) => void;
};

const IngredientRow = ({
  ingredient,
  isChecked,
  onToggle,
}: IngredientRowProps) => {
  const { name } = ingredient;
  const qty = formatIngredientQuantity(ingredient);
  return (
    <li className="flex min-h-[50px]">
      <button
        className="flex min-h-[50px] w-full items-center gap-4 px-6 py-2"
        onClick={() => onToggle(name)}
        aria-label={`${isChecked ? "Uncheck" : "Check"} ${name}`}
        aria-pressed={isChecked}
      >
        <span
          className={[
            "flex size-[50px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            isChecked
              ? "border-accent-500 bg-accent-500"
              : "border-accent-300 bg-white",
          ].join(" ")}
        >
          <Check
            className={[
              "size-6 transition-colors",
              isChecked ? "text-white" : "text-stone-200",
            ].join(" ")}
            strokeWidth={3}
          />
        </span>
        <span
          className={[
            "flex flex-1 flex-wrap items-baseline gap-x-2 text-left",
            isChecked ? "text-stone-400" : "text-stone-700",
          ].join(" ")}
        >
          <span className={`font-medium ${isChecked ? "line-through" : ""}`}>
            {name}
          </span>
          {qty && <span className="text-sm">{qty}</span>}
        </span>
      </button>
    </li>
  );
};

export const IngredientsList = () => {
  const { state, handleToggleIngredient } = useRecipeContext();
  const { recipe, checked_ingredients } = state;

  if (!recipe) return null;

  const { ingredients } = recipe;
  const checkedIngredients = checked_ingredients ?? [];

  const useGroups = ingredients.length > 6;
  const groups = useGroups
    ? groupIngredientsByCategory(ingredients)
    : [{ category: "", items: ingredients }];

  const checkedSet = new Set(checkedIngredients);
  const checkedCount = ingredients.filter((i) => checkedSet.has(i.name)).length;

  return (
    <section className="py-4">
      <h2 className="flex items-baseline gap-2 px-6 pb-2 font-heading text-lg font-semibold text-stone-700">
        Ingredients
        <span className="font-body text-sm font-normal text-stone-400">
          ({checkedCount}/{ingredients.length})
        </span>
      </h2>
      {groups.map(({ category, items }) => (
        <div key={category || "all"}>
          {useGroups && category && (
            <h3 className="px-6 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
              {category}
            </h3>
          )}
          <ul className="divide-y divide-stone-100">
            {items.map((ingredient, index) => (
              <IngredientRow
                key={`${category || "all"}-${index}`}
                ingredient={ingredient}
                isChecked={checkedSet.has(ingredient.name)}
                onToggle={handleToggleIngredient}
              />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};
