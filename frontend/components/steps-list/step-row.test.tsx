import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { components } from "@/types/api";
import { StepRow } from "./step-row";

type RecipeStep = components["schemas"]["RecipeStep"];

const makeStep = (overrides: Partial<RecipeStep> = {}): RecipeStep => ({
  step_number: 1,
  instruction: "Boil the water",
  duration_minutes: 10,
  timer_label: null,
  requires_attention: false,
  tips: [],
  ...overrides,
});

describe("StepRow", () => {
  describe("rendering", () => {
    it("should render the step instruction", () => {
      render(<StepRow step={makeStep()} index={0} currentStep={0} onJump={vi.fn()} />);
      expect(screen.getByText("Boil the water")).toBeInTheDocument();
    });

    it("should render the step number in the circle", () => {
      render(
        <StepRow step={makeStep({ step_number: 3 })} index={2} currentStep={0} onJump={vi.fn()} />,
      );
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should render a button with an aria-label including the step number", () => {
      render(
        <StepRow step={makeStep({ step_number: 2 })} index={1} currentStep={0} onJump={vi.fn()} />,
      );
      expect(screen.getByRole("button", { name: "Go to step 2" })).toBeInTheDocument();
    });
  });

  describe("active state", () => {
    it("should set aria-current=step on the active step", () => {
      render(<StepRow step={makeStep()} index={0} currentStep={0} onJump={vi.fn()} />);
      expect(screen.getByRole("button", { name: "Go to step 1" })).toHaveAttribute(
        "aria-current",
        "step",
      );
    });

    it("should not set aria-current on inactive steps", () => {
      render(<StepRow step={makeStep()} index={2} currentStep={0} onJump={vi.fn()} />);
      expect(screen.getByRole("button")).not.toHaveAttribute("aria-current");
    });
  });

  describe("done state", () => {
    it("should apply line-through to a done step instruction", () => {
      render(<StepRow step={makeStep()} index={0} currentStep={2} onJump={vi.fn()} />);
      expect(screen.getByText("Boil the water")).toHaveClass("line-through");
    });

    it("should not apply line-through to a non-done step", () => {
      render(<StepRow step={makeStep()} index={0} currentStep={0} onJump={vi.fn()} />);
      expect(screen.getByText("Boil the water")).not.toHaveClass("line-through");
    });
  });

  describe("hint display", () => {
    it("should show tips on the active step", () => {
      render(
        <StepRow
          step={makeStep({ tips: ["Watch the heat"] })}
          index={0}
          currentStep={0}
          onJump={vi.fn()}
        />,
      );
      expect(screen.getByText("Watch the heat")).toBeInTheDocument();
    });

    it("should not show tips on a non-active step", () => {
      render(
        <StepRow
          step={makeStep({ tips: ["Watch the heat"] })}
          index={2}
          currentStep={0}
          onJump={vi.fn()}
        />,
      );
      expect(screen.queryByText("Watch the heat")).not.toBeInTheDocument();
    });
  });

  describe("jump interaction", () => {
    it("should call onJump with the step index when clicked", async () => {
      const user = userEvent.setup();
      const onJump = vi.fn();
      render(<StepRow step={makeStep()} index={3} currentStep={0} onJump={onJump} />);
      await user.click(screen.getByRole("button"));
      expect(onJump).toHaveBeenCalledWith(3);
    });
  });
});
