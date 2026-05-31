import { render, screen } from "@testing-library/react";
import { recipeContextFixture } from "@/domain/__fixtures__/recipe-context";
import { RecipeHeader } from "./recipe-header";

const recipe = recipeContextFixture.recipe!;

describe("RecipeHeader", () => {
  it("renders the recipe title as a heading", () => {
    render(<RecipeHeader recipe={recipe} />);
    expect(
      screen.getByRole("heading", { name: /spaghetti al pomodoro/i }),
    ).toBeInTheDocument();
  });

  it("falls back to Untitled Recipe when title is empty", () => {
    render(<RecipeHeader recipe={{ ...recipe, title: "" }} />);
    expect(
      screen.getByRole("heading", { name: /untitled recipe/i }),
    ).toBeInTheDocument();
  });

  it("renders prep time from recipe.prep_time_minutes", () => {
    render(<RecipeHeader recipe={recipe} />);
    expect(screen.getByText(/10\s*min\s*prep/i)).toBeInTheDocument();
  });

  it("renders cook time from recipe.cook_time_minutes", () => {
    render(<RecipeHeader recipe={recipe} />);
    expect(screen.getByText(/20\s*min\s*cook/i)).toBeInTheDocument();
  });

  it("renders servings from recipe.servings", () => {
    render(<RecipeHeader recipe={recipe} />);
    expect(screen.getByText(/4 servings/i)).toBeInTheDocument();
  });

  it("renders difficulty", () => {
    render(<RecipeHeader recipe={recipe} />);
    expect(screen.getByText("easy")).toBeInTheDocument();
  });

  it("omits difficulty pill when difficulty is missing", () => {
    render(<RecipeHeader recipe={{ ...recipe, difficulty: undefined as never }} />);
    expect(screen.queryByText("easy")).not.toBeInTheDocument();
  });

  it("renders the cuisine as a tag", () => {
    render(<RecipeHeader recipe={recipe} />);
    expect(screen.getByText("Italian")).toBeInTheDocument();
  });

  it("renders dietary tags as pills", () => {
    render(<RecipeHeader recipe={recipe} />);
    expect(screen.getByText("vegetarian")).toBeInTheDocument();
  });

  it("omits cuisine tag when cuisine is null", () => {
    render(<RecipeHeader recipe={{ ...recipe, cuisine: null }} />);
    expect(screen.queryByText("Italian")).not.toBeInTheDocument();
  });

  it("omits prep time when prep_time_minutes is null", () => {
    render(<RecipeHeader recipe={{ ...recipe, prep_time_minutes: null }} />);
    expect(screen.queryByText(/min\s*prep/i)).not.toBeInTheDocument();
  });
});
