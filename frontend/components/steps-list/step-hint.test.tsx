import { render, screen } from "@testing-library/react";
import type { components } from "@/types/api";
import { StepHint } from "./step-hint";

type RecipeStep = components["schemas"]["RecipeStep"];

const makeStep = (overrides: Partial<RecipeStep> = {}): RecipeStep => ({
  step_number: 1,
  instruction: "Test instruction",
  duration_minutes: 5,
  timer_label: null,
  requires_attention: false,
  tips: [],
  ...overrides,
});

describe("StepHint", () => {
  describe("null guard", () => {
    it("should render nothing when requires_attention is false and tips are empty", () => {
      const { container } = render(<StepHint step={makeStep()} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("neutral tips", () => {
    it("should render tips when requires_attention is false", () => {
      render(<StepHint step={makeStep({ tips: ["Watch the heat"] })} />);
      expect(screen.getByText("Watch the heat")).toBeInTheDocument();
    });

    it("should render all tips when multiple are provided", () => {
      render(<StepHint step={makeStep({ tips: ["Tip one", "Tip two"] })} />);
      expect(screen.getByText("Tip one")).toBeInTheDocument();
      expect(screen.getByText("Tip two")).toBeInTheDocument();
    });

    it("should not render amber warning container for neutral tips", () => {
      const { container } = render(
        <StepHint step={makeStep({ tips: ["Watch the heat"] })} />,
      );
      expect(container.querySelector(".bg-amber-50")).not.toBeInTheDocument();
    });
  });

  describe("attention warning", () => {
    it("should render tips in amber styling when requires_attention is true", () => {
      render(
        <StepHint
          step={makeStep({ requires_attention: true, tips: ["Watch the garlic"] })}
        />,
      );
      expect(screen.getByText("Watch the garlic")).toBeInTheDocument();
    });

    it("should render fallback text when requires_attention is true and tips are empty", () => {
      render(<StepHint step={makeStep({ requires_attention: true, tips: [] })} />);
      expect(screen.getByText("Pay close attention.")).toBeInTheDocument();
    });

    it("should not show fallback text when requires_attention is true but tips are provided", () => {
      render(
        <StepHint
          step={makeStep({ requires_attention: true, tips: ["Real warning tip"] })}
        />,
      );
      expect(screen.getByText("Real warning tip")).toBeInTheDocument();
      expect(screen.queryByText("Pay close attention.")).not.toBeInTheDocument();
    });

    it("should use the amber container for warning tips", () => {
      const { container } = render(
        <StepHint step={makeStep({ requires_attention: true, tips: ["Be careful"] })} />,
      );
      expect(container.querySelector(".bg-amber-50")).toBeInTheDocument();
    });
  });
});
