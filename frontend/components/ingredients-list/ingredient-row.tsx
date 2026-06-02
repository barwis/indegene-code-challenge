import type { components } from "@/types/api";
import { Check } from "lucide-react";
import { formatIngredientQuantity } from "@domain/ingredients";
import { AnimatedNode } from "@components";

type Ingredient = components["schemas"]["Ingredient"];

type IngredientRowProps = {
  ingredient: Ingredient;
  isChecked: boolean;
  onToggle: (name: string) => void;
  delay: number;
};

const IngredientRow = ({ ingredient, isChecked, onToggle, delay }: IngredientRowProps) => {
  const { name } = ingredient;
  const qty = formatIngredientQuantity(ingredient);
  return (
    <AnimatedNode as="li" delay={delay} className="flex min-h-[50px]">
      <button
        className="flex min-h-[50px] w-full items-center gap-4 px-6 py-2"
        onClick={() => onToggle(name)}
        aria-label={`${isChecked ? "Uncheck" : "Check"} ${name}`}
        aria-pressed={isChecked}
      >
        <span
          className={[
            "flex size-[50px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 motion-safe:transition-[colors,transform]",
            isChecked
              ? "border-accent-500 bg-accent-500 motion-safe:scale-110"
              : "border-accent-300 bg-white",
          ].join(" ")}
        >
          <Check
            className={[
              "size-6 transition-colors duration-200 motion-safe:transition-[colors,transform]",
              isChecked
                ? "text-white motion-safe:scale-100"
                : "text-stone-200 motion-safe:scale-75",
            ].join(" ")}
            strokeWidth={3}
          />
        </span>
        <span
          className={[
            "flex flex-1 flex-wrap items-baseline gap-x-2 text-left",
            isChecked ? "text-stone-400" : "text-stone-700",
          ].join(" ")}
        >
          <span className={`font-medium ${isChecked ? "line-through" : ""}`}>
            {name}
          </span>
          {qty && <span className="text-sm">{qty}</span>}
        </span>
      </button>
    </AnimatedNode>
  );
};

export type { IngredientRowProps };
export { IngredientRow };
