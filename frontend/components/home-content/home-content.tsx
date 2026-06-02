"use client";

import {
  ChatDrawer,
  ChatPanel,
  RecipeHeader,
  Tabs,
  Tab,
  IngredientsList,
  StepsList,
  UploadRecipe,
} from "@components";
import { useRecipeContext } from "@context/recipe-context";

const HomeContent = () => {
  const { state } = useRecipeContext();
  const { recipe } = state;

  if (recipe) {
    return (
      <div className="flex h-full flex-col md:flex-row">
        <div className="flex flex-1 flex-col overflow-y-auto bg-accent-50 motion-safe:animate-in motion-safe:fade-in-0 duration-500 md:flex-[1.8] md:overflow-hidden">
          <RecipeHeader recipe={recipe} />
          <Tabs ariaLabel="Recipe sections">
            <Tab tabId="ingredients" tabTitle="Ingredients">
              <IngredientsList />
            </Tab>
            <Tab tabId="steps">
              <StepsList />
            </Tab>
          </Tabs>
        </div>
        <div className="hidden md:flex flex-1 flex-col border-l border-stone-200 bg-stone-100">
          <ChatPanel />
        </div>
        <ChatDrawer />
      </div>
    );
  }

  return <UploadRecipe />;
};

export { HomeContent };
