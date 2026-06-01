import { useState } from "react";
import type { components } from "@/types/api";
import { useRecipeUpload } from "@/app/hooks/use-recipe-upload";
import { IngredientsList } from "./ingredients-list";

type Recipe = components["schemas"]["Recipe"];

export type RecipeTabsProps = {
  recipe: Recipe;
  checkedIngredients: string[];
};

type TabId = "ingredients" | "steps";

const TABS: { id: TabId; label: string }[] = [
  { id: "ingredients", label: "Ingredients" },
  { id: "steps", label: "Steps" },
];

export const RecipeTabs = ({ recipe, checkedIngredients }: RecipeTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("ingredients");
  const { handleToggleIngredient } = useRecipeUpload();

  return (
    <div className="flex flex-1 flex-col">
      <div
        role="tablist"
        aria-label="Recipe sections"
        className="flex border-b border-stone-200 px-6"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setActiveTab(id)}
            className={[
              "min-h-[50px] px-6 text-sm font-medium transition-colors",
              activeTab === id
                ? "border-b-2 border-accent-500 text-accent-600"
                : "text-stone-500 hover:text-stone-700",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="panel-ingredients"
        aria-labelledby="tab-ingredients"
        hidden={activeTab !== "ingredients"}
        className="overflow-y-auto"
      >
        <IngredientsList
          ingredients={recipe.ingredients}
          checkedIngredients={checkedIngredients}
          onToggle={handleToggleIngredient}
        />
      </div>

      <div
        role="tabpanel"
        id="panel-steps"
        aria-labelledby="tab-steps"
        hidden={activeTab !== "steps"}
        className="overflow-y-auto"
      >
        <p className="px-6 py-8 text-center text-sm text-stone-400">
          Steps coming soon.
        </p>
      </div>
    </div>
  );
};
