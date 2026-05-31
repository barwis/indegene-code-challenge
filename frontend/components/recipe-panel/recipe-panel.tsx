import type { components } from "@/types/api";
import { RecipeHeader } from "./recipe-header";

type RecipeContext = components["schemas"]["RecipeContext"];

export type RecipePanelProps = {
  state: RecipeContext;
};

export const RecipePanel = ({ state }: RecipePanelProps) => {
  if (!state.recipe) return null;
  return <RecipeHeader recipe={state.recipe} />;
};
