"use client";

import type { PropsWithChildren } from "react";
import { useRecipeContext } from "@context/recipe-context";
import { Toast } from "../toast";
import { ErrorBoundary } from "./error-boundary";

const RecipeErrorBoundary = ({ children }: PropsWithChildren) => {
  const { resetRecipe } = useRecipeContext();

  return (
    <ErrorBoundary aside={<Toast />} onReset={resetRecipe}>
      {children}
    </ErrorBoundary>
  );
};

export { RecipeErrorBoundary };
