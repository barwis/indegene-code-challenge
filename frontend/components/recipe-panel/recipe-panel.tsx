import type { components } from "@/types/api";
import { RecipeHeader } from "./recipe-header";
import { RecipeTabs } from "./recipe-tabs";

type RecipeContext = components["schemas"]["RecipeContext"];

export type RecipePanelProps = {
  state: RecipeContext;
};

export const RecipePanel = ({ state }: RecipePanelProps) => {
  if (!state.recipe) return null;
  return (
    <>
      <RecipeHeader recipe={state.recipe} />
      <RecipeTabs
        recipe={state.recipe}
        checkedIngredients={state.checked_ingredients ?? []}
      />
    </>
  );
};
