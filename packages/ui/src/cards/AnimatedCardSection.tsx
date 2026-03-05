"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "../utils";

type ColumnsConfig = {
  base?: 1 | 2;
  sm?: 1 | 2 | 3;
  md?: 1 | 2 | 3 | 4;
  lg?: 1 | 2 | 3 | 4;
};

export type AnimatedCardSectionProps<T> = {
  as?: "section" | "div";
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  /**
   * Optional items + renderItem pattern, primarily for client-side usage.
   * For server components, prefer passing pre-rendered children instead
   * to avoid passing functions across the RSC boundary.
   */
  items?: T[];
  renderItem?: (item: T, index: number) => ReactNode;
  emptyState?: ReactNode;
  viewAllHref?: string;
  viewAllLabel?: string;
  columns?: ColumnsConfig;
  className?: string;
  headerClassName?: string;
  gridClassName?: string;
  footerClassName?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

function getGridColumnsClasses(columns?: ColumnsConfig): string[] {
  const classes: string[] = ["grid", "gap-3"];

  const base =
    columns?.base === 1
      ? "grid-cols-1"
      : columns?.base === 2
        ? "grid-cols-2"
        : columns?.base === 3
          ? "grid-cols-3"
          : columns?.base === 4
            ? "grid-cols-4"
            : "grid-cols-1";
  classes.push(base);

  const sm =
    columns?.sm === 1
      ? "sm:grid-cols-1"
      : columns?.sm === 2
        ? "sm:grid-cols-2"
        : columns?.sm === 3
          ? "sm:grid-cols-3"
          : columns?.sm === 4
            ? "sm:grid-cols-4"
            : null;
  if (sm) classes.push(sm);

  const md =
    columns?.md === 1
      ? "md:grid-cols-1"
      : columns?.md === 2
        ? "md:grid-cols-2"
        : columns?.md === 3
          ? "md:grid-cols-3"
          : columns?.md === 4
            ? "md:grid-cols-4"
            : null;
  if (md) classes.push(md);

  const lg =
    columns?.lg === 1
      ? "lg:grid-cols-1"
      : columns?.lg === 2
        ? "lg:grid-cols-2"
        : columns?.lg === 3
          ? "lg:grid-cols-3"
          : columns?.lg === 4
            ? "lg:grid-cols-4"
            : null;
  if (lg) classes.push(lg);

  return classes;
}

export function AnimatedCardSection<T>({
  as = "section",
  title,
  subtitle,
  eyebrow,
  items,
  renderItem,
  emptyState,
  viewAllHref,
  viewAllLabel = "View all",
  columns,
  className,
  headerClassName,
  gridClassName,
  footerClassName,
  children,
  style,
  ...rest
}: AnimatedCardSectionProps<T>) {
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasEnteredView) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setHasEnteredView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasEnteredView(true);
            observer.unobserve(entry.target);
            break;
          }
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -15% 0px",
        threshold: 0.15,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasEnteredView]);

  const Component = as;

  const animationStyle: CSSProperties = {
    opacity: hasEnteredView ? 1 : 0,
    transform: hasEnteredView ? "translateY(0px)" : "translateY(16px)",
    transition: "opacity 900ms ease-in, transform 900ms ease-in",
    ...style,
  };

  const hasItems = Array.isArray(items) && items.length > 0 && typeof renderItem === "function";
  const gridClasses = getGridColumnsClasses(columns);

  return (
    <Component
      ref={ref as any}
      data-in-view={hasEnteredView ? "true" : "false"}
      className={cn("group/section will-change-transform will-change-opacity mt-8", className)}
      style={animationStyle}
      {...rest}
    >
      {(eyebrow || title || subtitle) && (
        <div className={cn("flex items-center justify-between gap-2", headerClassName)}>
          <div>
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
            ) : null}
            {title ? (
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {hasItems ? (
        <div className={cn("mt-3", ...gridClasses, gridClassName)}>
          {items!.map((item, index) => renderItem!(item, index))}
        </div>
      ) : children ? (
        <div className={cn("mt-3", ...gridClasses, gridClassName)}>{children}</div>
      ) : (
        emptyState ?? null
      )}

      {viewAllHref ? (
        <div className={cn("mt-3", footerClassName)}>
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-primary hover:underline"
          >
            {viewAllLabel}
          </Link>
        </div>
      ) : null}
    </Component>
  );
}

