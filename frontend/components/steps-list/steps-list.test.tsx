import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { recipeContextFixture } from "@domain/__fixtures__/recipe-context";
import { mockUseRecipeContext } from "@test-utils/recipe-context-mock";
import { StepsList } from "./steps-list";

vi.mock("@context/recipe-context");

describe("StepsList", () => {
  describe("rendering all steps", () => {
    it("should render every step instruction", () => {
      mockUseRecipeContext();
      render(<StepsList />);
      expect(screen.getByText(/Bring a large pot of water/i)).toBeInTheDocument();
      expect(screen.getByText(/Heat olive oil/i)).toBeInTheDocument();
      expect(screen.getByText(/Add crushed tomatoes/i)).toBeInTheDocument();
      expect(screen.getByText(/Cook spaghetti/i)).toBeInTheDocument();
      expect(screen.getByText(/Drain the pasta/i)).toBeInTheDocument();
    });

    it("should render a Steps heading", () => {
      mockUseRecipeContext();
      render(<StepsList />);
      expect(screen.getByRole("heading", { name: /steps/i })).toBeInTheDocument();
    });

    it("should show current step progress in the heading", () => {
      mockUseRecipeContext({ state: { ...recipeContextFixture, current_step: 2 } });
      render(<StepsList />);
      const total = recipeContextFixture.recipe!.steps.length;
      expect(screen.getByText(`(2/${total} done)`)).toBeInTheDocument();
    });
  });

  describe("jump interaction", () => {
    it("should call handleSetCurrentStep with the step index when tapping a step", async () => {
      const user = userEvent.setup();
      const handleSetCurrentStep = vi.fn();
      mockUseRecipeContext({ handleSetCurrentStep });
      render(<StepsList />);
      await user.click(screen.getByRole("button", { name: "Go to step 3" }));
      expect(handleSetCurrentStep).toHaveBeenCalledWith(2);
    });
  });

  describe("null guard", () => {
    it("should render nothing when recipe is null", () => {
      mockUseRecipeContext({
        state: { current_step: 0, cooking_started: false, recipe: null },
      });
      const { container } = render(<StepsList />);
      expect(container).toBeEmptyDOMElement();
    });
  });
});
