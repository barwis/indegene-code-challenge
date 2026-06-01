"use client";

import {
  ChatPanel,
  RecipeHeader,
  Tabs,
  Tab,
  IngredientsList,
  StepsList,
  UploadRecipe,
} from "@components";
import { RecipeProvider, useRecipeContext } from "@context/recipe-context";

const HomeContent = () => {
  const { state } = useRecipeContext();
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
              <StepsList />
            </Tab>
          </Tabs>
        </div>
        <div className="flex flex-1 flex-col border-l border-stone-200 bg-stone-100">
          <ChatPanel />
        </div>
      </div>
    );
  }

  return <UploadRecipe />;
};

const Home = () => (
  <RecipeProvider>
    <HomeContent />
  </RecipeProvider>
);

export default Home;
