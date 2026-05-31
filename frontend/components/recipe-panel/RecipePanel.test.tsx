import { render, screen } from "@testing-library/react";
import { recipeContextFixture } from "@/domain/__fixtures__/recipeContext";
import { RecipePanel } from "./RecipePanel";

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
