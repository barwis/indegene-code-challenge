"use client";

import { Toast } from "@components";
import { RecipeProvider } from "@context/recipe-context";
import { HomeContent } from "../components/home-content";

const Home = () => (
  <RecipeProvider>
    <HomeContent />
    <Toast />
  </RecipeProvider>
);

export default Home;
