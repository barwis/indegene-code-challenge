import { useRecipeContext } from "@context/recipe-context";
import { useScrollToTop } from "@hooks/use-scroll-to-top";
import { StepRow } from "./step-row";

const StepsList = () => {
  const sectionRef = useScrollToTop<HTMLElement>();
  const { state, handleSetCurrentStep } = useRecipeContext();
  const { recipe, current_step } = state;

  if (!recipe) return null;

  const { steps } = recipe;

  return (
    <section ref={sectionRef} className="flex flex-col gap-4 py-4">
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

export { StepsList };
