type Direction = "slide-left" | "slide-right" | "slide-up" | "slide-down";

const DIRECTION_CLASS: Record<Direction, string> = {
  "slide-left": "motion-safe:animate-slide-left",
  "slide-right": "motion-safe:animate-slide-right",
  "slide-up": "motion-safe:animate-slide-up",
  "slide-down": "motion-safe:animate-slide-down",
};

type OwnProps = {
  delay?: number;
  duration?: number;
  direction?: Direction;
  className?: string;
};

export type AnimatedNodeProps<
  T extends keyof React.JSX.IntrinsicElements = "div",
> = OwnProps & { as?: T } & Omit<
    React.ComponentPropsWithoutRef<T>,
    keyof OwnProps | "as" | "style"
  >;

export const AnimatedNode = <T extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  delay = 0,
  duration,
  direction = "slide-left",
  as,
  className = "",
  ...rest
}: AnimatedNodeProps<T>) => {
  const Tag = (as ?? "div") as React.ElementType;
  return (
    <Tag
      className={`${DIRECTION_CLASS[direction]} motion-safe:stagger ${className}`.trim()}
      style={
        {
          "--stagger-delay": `${delay}ms`,
          ...(duration !== undefined && {
            "--stagger-duration": `${duration}ms`,
          }),
        } as React.CSSProperties
      }
      {...rest}
    >
      {children}
    </Tag>
  );
};
