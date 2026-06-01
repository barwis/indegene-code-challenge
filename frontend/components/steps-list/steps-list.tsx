import type { components } from "@/types/api";
import { AlertTriangle } from "lucide-react";
import { useRecipeContext } from "@context/recipe-context";
import { getStepState, getStepTips, hasAttentionWarning } from "@domain/steps";
import { AnimatedNode } from "@components";

type RecipeStep = components["schemas"]["RecipeStep"];

type StepHintProps = {
  step: RecipeStep;
};

const StepHint = ({ step }: StepHintProps) => {
  const tips = getStepTips(step);
  const isWarning = hasAttentionWarning(step);

  if (!isWarning && tips.length === 0) return null;

  if (isWarning) {
    const warningTips = tips.length > 0 ? tips : ["Pay close attention."];
    return (
      <span className="mt-2 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-amber-800">
        <AlertTriangle className="mt-0.5 size-4 flex-shrink-0" />
        <span className="flex flex-col gap-1 text-sm">
          {warningTips.map((tip, i) => (
            <span key={i}>{tip}</span>
          ))}
        </span>
      </span>
    );
  }

  return (
    <span className="mt-2 flex items-start gap-2 rounded-md bg-stone-50 px-3 py-2 text-stone-600">
      <span className="flex flex-col gap-1 text-sm">
        {tips.map((tip, i) => (
          <span key={i}>{tip}</span>
        ))}
      </span>
    </span>
  );
};

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
    "flex w-full items-start gap-4 px-6 py-4 text-left",
    "transition-opacity duration-[280ms] ease-stagger",
    isDone ? "opacity-50" : !isActive ? "opacity-60" : "",
  ].join(" ").trim();

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
        isActive ? "scale-[1.05] relative z-10 bg-white shadow-md rounded-xl" : "",
      ].join(" ").trim()}
    >
      <button
        className={rowClass}
        onClick={() => onJump(index)}
        aria-label={`Go to step ${step_number}`}
        aria-current={isActive ? "step" : undefined}
      >
        <span className={circleClass}>{step_number}</span>
        <span className="flex flex-1 flex-col">
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

export const StepsList = () => {
  const { state, handleSetCurrentStep } = useRecipeContext();
  const { recipe, current_step } = state;

  if (!recipe) return null;

  const { steps } = recipe;

  return (
    <section className="flex flex-col gap-4 py-4">
      <h2 className="flex items-baseline gap-2 px-6 font-heading text-lg font-semibold text-stone-700">
        Steps
        <span className="font-body text-sm font-normal text-stone-400">
          ({current_step}/{steps.length} done)
        </span>
      </h2>
      <ol className="list-none flex flex-col gap-4 ">
        {steps.map((step, index) => (
          <StepRow
            key={step.step_number}
            step={step}
            index={index}
            currentStep={current_step}
            onJump={handleSetCurrentStep}
          />
        ))}
      </ol>
    </section>
  );
};
