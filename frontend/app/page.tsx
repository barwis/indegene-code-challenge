"use client";

import { UploadRecipe } from "@components";
import { useRecipeUpload } from "./hooks/use-recipe-upload";

const Home = () => {
  const { state, isLoading, error, handleUpload } = useRecipeUpload();

  if (state.recipe) {
    return (
      <div className="flex h-full">
        <div className="flex flex-[1.8] flex-col overflow-y-auto bg-accent-50 p-8">
          <h2 className="font-heading text-2xl font-semibold text-accent-700">
            {state.recipe.title}
          </h2>
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
    />
  );
};

export default Home;
