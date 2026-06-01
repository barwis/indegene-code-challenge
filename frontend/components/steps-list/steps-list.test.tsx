import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { recipeContextFixture } from "@domain/__fixtures__/recipe-context";
import { mockUseRecipeUpload } from "@test-utils/use-recipe-upload-mock";
import { StepsList } from "./steps-list";

vi.mock("@hooks/use-recipe-upload");

describe("StepsList", () => {
  describe("rendering all steps", () => {
    it("should render every step instruction", () => {
      mockUseRecipeUpload();
      render(<StepsList />);
      expect(
        screen.getByText(/Bring a large pot of water/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Heat olive oil/i)).toBeInTheDocument();
      expect(screen.getByText(/Add crushed tomatoes/i)).toBeInTheDocument();
      expect(screen.getByText(/Cook spaghetti/i)).toBeInTheDocument();
      expect(screen.getByText(/Drain the pasta/i)).toBeInTheDocument();
    });

    it("should render a Steps heading", () => {
      mockUseRecipeUpload();
      render(<StepsList />);
      expect(screen.getByRole("heading", { name: /steps/i })).toBeInTheDocument();
    });

    it("should show current step progress in the heading", () => {
      mockUseRecipeUpload({ state: { ...recipeContextFixture, current_step: 2 } });
      render(<StepsList />);
      const total = recipeContextFixture.recipe!.steps.length;
      expect(screen.getByText(`(2/${total} done)`)).toBeInTheDocument();
    });

    it("should render step numbers", () => {
      mockUseRecipeUpload();
      render(<StepsList />);
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  describe("step visual state", () => {
    it("should mark the active step with aria-current=step", () => {
      mockUseRecipeUpload({ state: { ...recipeContextFixture, current_step: 1 } });
      render(<StepsList />);
      expect(
        screen.getByRole("button", { name: "Go to step 2" }),
      ).toHaveAttribute("aria-current", "step");
    });

    it("should not set aria-current on non-active steps", () => {
      mockUseRecipeUpload({ state: { ...recipeContextFixture, current_step: 1 } });
      render(<StepsList />);
      expect(
        screen.getByRole("button", { name: "Go to step 1" }),
      ).not.toHaveAttribute("aria-current");
      expect(
        screen.getByRole("button", { name: "Go to step 3" }),
      ).not.toHaveAttribute("aria-current");
    });

    it("should apply line-through to done step instructions", () => {
      mockUseRecipeUpload({ state: { ...recipeContextFixture, current_step: 2 } });
      render(<StepsList />);
      expect(screen.getByText(/Bring a large pot of water/i)).toHaveClass(
        "line-through",
      );
      expect(screen.getByText(/Heat olive oil/i)).toHaveClass("line-through");
    });

    it("should not apply line-through to active or upcoming steps", () => {
      mockUseRecipeUpload({ state: { ...recipeContextFixture, current_step: 1 } });
      render(<StepsList />);
      expect(screen.getByText(/Heat olive oil/i)).not.toHaveClass("line-through");
      expect(screen.getByText(/Add crushed tomatoes/i)).not.toHaveClass(
        "line-through",
      );
    });
  });

  describe("tips and attention", () => {
    it("should show tips on the active step when requires_attention is false", () => {
      mockUseRecipeUpload({ state: { ...recipeContextFixture, current_step: 0 } });
      render(<StepsList />);
      expect(
        screen.getByText(/1 tbsp of salt per litre/i),
      ).toBeInTheDocument();
    });

    it("should not show tips on non-active steps", () => {
      mockUseRecipeUpload({ state: { ...recipeContextFixture, current_step: 0 } });
      render(<StepsList />);
      expect(
        screen.queryByText(/Remove garlic before it browns/i),
      ).not.toBeInTheDocument();
    });

    it("should show attention warning styled tip on active step with requires_attention", () => {
      mockUseRecipeUpload({ state: { ...recipeContextFixture, current_step: 1 } });
      render(<StepsList />);
      expect(
        screen.getByText(/Remove garlic before it browns/i),
      ).toBeInTheDocument();
    });

    it("should not show attention warning on non-active steps with requires_attention", () => {
      mockUseRecipeUpload({ state: { ...recipeContextFixture, current_step: 0 } });
      render(<StepsList />);
      expect(
        screen.queryByText(/Remove garlic before it browns/i),
      ).not.toBeInTheDocument();
    });

    it("should show fallback attention text when step requires_attention and has no tips", () => {
      const stepsWithAttentionNoTip = recipeContextFixture.recipe!.steps.map(
        (s, i) =>
          i === 0
            ? { ...s, requires_attention: true, tips: [] }
            : s,
      );
      mockUseRecipeUpload({
        state: {
          ...recipeContextFixture,
          current_step: 0,
          recipe: {
            ...recipeContextFixture.recipe!,
            steps: stepsWithAttentionNoTip,
          },
        },
      });
      render(<StepsList />);
      expect(screen.getByText(/pay close attention/i)).toBeInTheDocument();
    });
  });

  describe("jump interaction", () => {
    it("should call handleSetCurrentStep with the step index when tapping a step", async () => {
      const user = userEvent.setup();
      const handleSetCurrentStep = vi.fn();
      mockUseRecipeUpload({ handleSetCurrentStep });
      render(<StepsList />);
      await user.click(screen.getByRole("button", { name: "Go to step 3" }));
      expect(handleSetCurrentStep).toHaveBeenCalledWith(2);
    });

    it("should call handleSetCurrentStep with 0 when tapping the first step", async () => {
      const user = userEvent.setup();
      const handleSetCurrentStep = vi.fn();
      mockUseRecipeUpload({ handleSetCurrentStep });
      render(<StepsList />);
      await user.click(screen.getByRole("button", { name: "Go to step 1" }));
      expect(handleSetCurrentStep).toHaveBeenCalledWith(0);
    });
  });

  describe("null guard", () => {
    it("should render nothing when recipe is null", () => {
      mockUseRecipeUpload({
        state: { current_step: 0, cooking_started: false, recipe: null },
      });
      const { container } = render(<StepsList />);
      expect(container).toBeEmptyDOMElement();
    });
  });
});
