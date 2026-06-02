import type { components } from "@/types/api";
import { AlertTriangle } from "lucide-react";
import { getStepTips, hasAttentionWarning } from "@domain/steps";

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

export type { StepHintProps };
export { StepHint };
