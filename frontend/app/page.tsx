"use client";

import { RecipePanel, UploadRecipe } from "@components";
import { useRecipeUpload } from "./hooks/use-recipe-upload";

const Home = () => {
  const { state, isLoading, error, handleUpload, handleFixture } = useRecipeUpload();

  if (state.recipe) {
    return (
      <div className="flex h-full">
        <div className="flex flex-[1.8] flex-col overflow-y-auto bg-accent-50">
          <RecipePanel state={state} />
        </div>
        <div className="flex flex-1 flex-col border-l border-stone-200 bg-stone-100" />
      </div>
    );
  }

  return (
    <UploadRecipe
      onUpload={handleUpload}
      isLoading={isLoading}
      error={error}
      onUseFixture={process.env.NODE_ENV !== "production" ? handleFixture : undefined}
    />
  );
};

export default Home;
