"use client";

import { RecipeProvider } from "@context/recipe-context";
import { RecipeErrorBoundary } from "@components";
import { HomeContent } from "../components/home-content";

const Home = () => (
  <RecipeProvider>
    <RecipeErrorBoundary>
      <HomeContent />
    </RecipeErrorBoundary>
  </RecipeProvider>
);

export default Home;
