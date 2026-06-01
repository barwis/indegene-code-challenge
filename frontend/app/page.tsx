"use client";

import {
  RecipeHeader,
  Tabs,
  Tab,
  IngredientsList,
  UploadRecipe,
} from "@components";
import { useRecipeUpload } from "@hooks/use-recipe-upload";

const Home = () => {
  const { state } = useRecipeUpload();
  const { recipe } = state;

  if (recipe) {
    return (
      <div className="flex h-full">
        <div className="flex flex-[1.8] flex-col overflow-y-auto bg-accent-50">
          <RecipeHeader recipe={recipe} />
          <Tabs ariaLabel="Recipe sections">
            <Tab tabId="ingredients" tabTitle="Ingredients">
              <IngredientsList />
            </Tab>
            <Tab tabId="steps">
              <p className="px-6 py-8 text-center text-sm text-stone-400">
                Steps coming soon.
              </p>
            </Tab>
          </Tabs>
        </div>
        <div className="flex flex-1 flex-col border-l border-stone-200 bg-stone-100" />
      </div>
    );
  }

  return <UploadRecipe />;
};

export default Home;
