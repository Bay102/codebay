import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const tagVariants = cva("inline-flex items-center font-medium uppercase", {
  variants: {
    variant: {
      muted: "text-foreground/60",
      pill: "rounded-md border border-border/60 bg-secondary/60 text-foreground/90",
      tech: "rounded-md border border-border/50 border-l-2 border-l-primary/45 bg-secondary/50 text-foreground/90",
    },
    size: {
      sm: "px-2 py-0.5 text-[9px] tracking-[0.18em]",
      md: "px-2.5 py-0.5 text-xs tracking-[0.08em]",
      lg: "px-3 py-1 text-xs tracking-[0.08em]",
    },
  },
  defaultVariants: {
    variant: "muted",
    size: "md",
  },
});

export interface TagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
  VariantProps<typeof tagVariants> {
  children: React.ReactNode;
}

function Tag({ className, variant, size, ...props }: TagProps) {
  return <span className={cn(tagVariants({ variant, size }), className)} {...props} />;
}

export { Tag, tagVariants };
