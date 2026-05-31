import type { components } from "@/types/api";
import { ChefHat, Flame, Timer, Users } from "lucide-react";

type Recipe = components["schemas"]["Recipe"];

export type RecipeHeaderProps = {
  recipe: Recipe;
};

export const RecipeHeader = ({ recipe }: RecipeHeaderProps) => {
  return (
    <header className="px-8 pb-4 pt-8">
      <h1 className="font-heading text-3xl font-semibold text-accent-700">
        {recipe.title || "Untitled Recipe"}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {recipe.prep_time_minutes != null && (
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm text-stone-600">
            <Timer className="size-3.5" />
            {recipe.prep_time_minutes} min prep
          </span>
        )}
        {recipe.cook_time_minutes != null && (
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm text-stone-600">
            <Flame className="size-3.5" />
            {recipe.cook_time_minutes} min cook
          </span>
        )}
        <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm text-stone-600">
          <Users className="size-3.5" />
          {recipe.servings} servings
        </span>
        {recipe.difficulty && (
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm capitalize text-stone-600">
            <ChefHat className="size-3.5" />
            {recipe.difficulty}
          </span>
        )}
      </div>
      {(recipe.cuisine != null || recipe.dietary_tags?.length) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {recipe.cuisine != null && (
            <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-medium text-accent-500">
              {recipe.cuisine}
            </span>
          )}
          {recipe.dietary_tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-stone-200 px-3 py-1 text-xs font-medium text-stone-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
};
