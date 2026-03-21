"use client";

import type { ReactNode, HTMLAttributes, CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type InViewSectionProps = {
  /**
   * Element type to render. Defaults to "div".
   */
  as?: "div" | "section";
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

export function InViewSection({ as = "div", className, style, children, ...rest }: InViewSectionProps) {
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
        rootMargin: "0px 0px -20% 0px",
        threshold: 0.15
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasEnteredView]);

  const Component = as;

  const animationStyle: CSSProperties = {
    opacity: hasEnteredView ? 1 : 0,
    transform: hasEnteredView ? "translateY(0px)" : "translateY(16px)",
    transition: "opacity 900ms ease-in, transform 900ms ease-in",
    ...style
  };

  return (
    <Component
      ref={ref as any}
      data-in-view={hasEnteredView ? "true" : "false"}
      className={["group/section will-change-transform will-change-opacity", className].filter(Boolean).join(" ")}
      style={animationStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}

