import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { recipeContextFixture } from "@/domain/__fixtures__/recipeContext";
import { RecipePanel } from "./RecipePanel";

vi.mock("@copilotkit/react-core", () => ({
  useCoAgent: vi.fn(),
}));

describe("RecipePanel", () => {
  it("renders the recipe title from the fixture", () => {
    render(<RecipePanel state={recipeContextFixture} />);
    expect(
      screen.getByRole("heading", { name: /spaghetti al pomodoro/i }),
    ).toBeInTheDocument();
  });

  it("renders the ingredient count from the fixture", () => {
    render(<RecipePanel state={recipeContextFixture} />);
    expect(screen.getByText(/6 ingredients/i)).toBeInTheDocument();
  });

  it("renders servings from scaled_servings when set", () => {
    render(<RecipePanel state={{ ...recipeContextFixture, scaled_servings: 8 }} />);
    expect(screen.getByText(/8 servings/i)).toBeInTheDocument();
  });

  it("falls back to recipe.servings when scaled_servings is null", () => {
    render(<RecipePanel state={{ ...recipeContextFixture, scaled_servings: null }} />);
    expect(screen.getByText(/4 servings/i)).toBeInTheDocument();
  });

  it("renders nothing when recipe is null", () => {
    const { container } = render(
      <RecipePanel state={{ ...recipeContextFixture, recipe: null }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
