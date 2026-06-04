import { useRecipeContext } from "@context/recipe-context";
import { useScrollToTop } from "@hooks/use-scroll-to-top";
import { groupIngredientsByCategory } from "@domain/ingredients";
import { IngredientRow } from "./ingredient-row";

const IngredientsList = () => {
  const sectionRef = useScrollToTop<HTMLElement>();
  const { state, handleToggleIngredient, handleSubstitute } =
    useRecipeContext();
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

  const groupsWithOffset = groups.map((g, i) => ({
    ...g,
    offset: groups
      .slice(0, i)
      .reduce((sum, { items }) => sum + items.length, 0),
  }));

  return (
    <section ref={sectionRef} className="py-4">
      <h2 className="flex items-baseline gap-2 px-6 pb-2 font-heading text-lg font-semibold text-stone-700">
        Ingredients
        <span className="font-body text-sm font-normal text-stone-400">
          ({checkedCount}/{ingredients.length})
        </span>
      </h2>
      {groupsWithOffset.map(({ category, items, offset }) => (
        <div key={category || "all"}>
          {useGroups && category && (
            <h3 className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
              {category}
            </h3>
          )}
          <ul className=" divide-y divide-stone-200 rounded-lg overflow-hidden">
            {items.map((ingredient, index) => (
              <IngredientRow
                key={`${category || "all"}-${index}`}
                ingredient={ingredient}
                isChecked={checkedSet.has(ingredient.name)}
                onToggle={handleToggleIngredient}
                onSubstitute={handleSubstitute}
                delay={(offset + index) * 150 + 100}
              />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};

export { IngredientsList };
