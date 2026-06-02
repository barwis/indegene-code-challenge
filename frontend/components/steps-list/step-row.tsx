import type { components } from "@/types/api";
import { getStepState } from "@domain/steps";
import { AnimatedNode } from "@components";
import { StepHint } from "./step-hint";

type RecipeStep = components["schemas"]["RecipeStep"];

type StepRowProps = {
  step: RecipeStep;
  index: number;
  currentStep: number;
  onJump: (index: number) => void;
};

const StepRow = ({ step, index, currentStep, onJump }: StepRowProps) => {
  const { step_number, instruction } = step;
  const state = getStepState(index, currentStep);
  const isActive = state === "active";
  const isDone = state === "done";

  const circleClass = [
    "flex size-[50px] flex-shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-colors duration-300 text-sm",
    isDone
      ? "border-stone-300 bg-stone-300 text-white"
      : isActive
        ? "border-accent-500 bg-accent-500 text-white"
        : "border-stone-200 bg-stone-100 text-stone-400",
  ].join(" ");

  const rowClass = [
    "flex w-full flex-col items-center gap-4 px-6 py-4 text-left md:flex-row md:items-start",
    "transition-opacity duration-[280ms] ease-stagger",
    isDone ? "opacity-50" : !isActive ? "opacity-60" : "",
  ]
    .join(" ")
    .trim();

  const instructionClass = [
    "text-base leading-relaxed",
    isDone ? "text-stone-400 line-through" : "text-stone-700",
  ].join(" ");

  return (
    <AnimatedNode
      as="li"
      delay={index * 150 + 100}
      className={[
        "border-b border-stone-100 last:border-b-0",
        "transition-[transform,box-shadow,background-color] duration-[280ms] ease-stagger",
        isActive
          ? "scale-[1.05] relative z-10 bg-white shadow-md rounded-xl"
          : "",
      ]
        .join(" ")
        .trim()}
    >
      <button
        className={rowClass}
        onClick={() => onJump(index)}
        aria-label={`Go to step ${step_number}`}
        aria-current={isActive ? "step" : undefined}
      >
        <span className={circleClass}>{step_number}</span>
        <span className="flex w-full flex-col md:flex-1 md:w-auto">
          <span className={instructionClass}>{instruction}</span>
          {isActive && (
            <span className="motion-safe:animate-in motion-safe:fade-in-0 duration-200">
              <StepHint step={step} />
            </span>
          )}
        </span>
      </button>
    </AnimatedNode>
  );
};

export type { StepRowProps };
export { StepRow };
