import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const tagVariants = cva("inline-flex items-center font-medium leading-none", {
  variants: {
    variant: {
      muted: "text-muted-foreground",
      pill: "rounded-md border border-border bg-secondary/60 text-foreground/90 hover:bg-secondary",
      tech: "rounded-md text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4",
    },
    size: {
      sm: "px-2 py-0.5 text-[11px]",
      md: "px-2.5 py-0.5 text-xs",
      lg: "px-3 py-1 text-xs",
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
