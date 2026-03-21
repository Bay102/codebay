import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "./utils";

const surfaceCardVariants = {
  hero: "border border-border/60 bg-card/40 px-6 py-8 sm:px-8 sm:py-10 md:px-10",
  panel: "border border-border/70 bg-card/60 p-6 sm:p-8",
  card: "border border-border/70 bg-card/60 p-4",
  subtle: "border border-dashed border-border/70 bg-card/40 p-6 sm:p-8",
  borderless: "border-none bg-card/60 p-4"
} as const;

type SurfaceCardVariant = keyof typeof surfaceCardVariants;

type SurfaceCardProps<T extends ElementType> = {
  as?: T;
  variant?: SurfaceCardVariant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function SurfaceCard<T extends ElementType = "section">({
  as,
  variant = "card",
  className,
  children,
  ...rest
}: SurfaceCardProps<T>) {
  const Comp = as ?? "section";

  return (
    <Comp className={cn(surfaceCardVariants[variant], className)} {...rest}>
      {children}
    </Comp>
  );
}
