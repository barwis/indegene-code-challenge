import type { components } from "@/types/api";

type RecipeContext = components["schemas"]["RecipeContext"];

export type RecipePanelProps = {
  state: RecipeContext;
};

export const RecipePanel = ({ state }: RecipePanelProps) => {
  const { recipe, scaled_servings } = state;
  if (!recipe) return null;

  const servings = scaled_servings ?? recipe.servings;

  return (
    <div className="p-8">
      <h2 className="font-heading text-2xl font-semibold text-accent-700">
        {recipe.title || "Untitled Recipe"}
      </h2>
      <div className="mt-4 flex gap-6 text-sm text-stone-500">
        <span>{servings} servings</span>
        <span>{recipe.ingredients.length} ingredients</span>
        <span>{recipe.steps.length} steps</span>
      </div>
    </div>
  );
};
