import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const tagVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 text-xs font-medium tracking-[0.08em] uppercase",
  {
    variants: {
      variant: {
        muted: "text-foreground/60",
        pill: "rounded-md border border-border/60 bg-secondary/60 text-foreground/90",
      },
    },
    defaultVariants: {
      variant: "muted",
    },
  }
);

export interface TagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof tagVariants> {
  children: React.ReactNode;
}

function Tag({ className, variant, ...props }: TagProps) {
  return <span className={cn(tagVariants({ variant }), className)} {...props} />;
}

export { Tag, tagVariants };
