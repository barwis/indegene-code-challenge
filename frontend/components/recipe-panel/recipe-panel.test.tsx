import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { recipeContextFixture } from "@/domain/__fixtures__/recipe-context";
import * as useRecipeUploadModule from "@/app/hooks/use-recipe-upload";
import { RecipePanel } from "./recipe-panel";

vi.mock("@/app/hooks/use-recipe-upload");

vi.spyOn(useRecipeUploadModule, "useRecipeUpload").mockReturnValue({
  state: recipeContextFixture,
  setState: vi.fn(),
  isLoading: false,
  error: null,
  handleUpload: vi.fn(),
  handleFixture: vi.fn(),
  handleToggleIngredient: vi.fn(),
});

describe("RecipePanel", () => {
  it("renders the recipe title from the fixture", () => {
    render(<RecipePanel state={recipeContextFixture} />);
    expect(
      screen.getByRole("heading", { name: /spaghetti al pomodoro/i }),
    ).toBeInTheDocument();
  });

  it("renders nothing when recipe is null", () => {
    const { container } = render(
      <RecipePanel state={{ ...recipeContextFixture, recipe: null }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
