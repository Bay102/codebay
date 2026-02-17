import { lazy, Suspense, useEffect, useRef } from "react";
import ChatSection from "./sections/ChatSection";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface SectionContainerProps {
  activeSection: SectionType;
  direction: number;
}

const sections: Record<SectionType, React.ComponentType> = {
  home: ChatSection,
  solutions: lazy(() => import("./sections/SolutionsSection")),
  products: lazy(() => import("./sections/ProductsSection")),
  resources: lazy(() => import("./sections/ResourcesSection")),
  "about-us": lazy(() => import("./sections/AboutSection")),
};

const SectionContainer = ({ activeSection, direction: _direction }: SectionContainerProps) => {
  const ActiveComponent = sections[activeSection];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

  return (
    <div className="[grid-area:1/1] z-10 h-[100dvh] overflow-hidden bg-background/70 px-6 pt-36 pb-6 backdrop-blur-[2px] md:pt-28 md:pb-8 lg:px-12 dark:bg-background/40 dark:backdrop-blur-[5px]">
      <div
        ref={scrollRef}
        className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain"
      >
        <Suspense fallback={<div className="relative flex-1" />}>
          <div key={activeSection} className="relative flex-1 animate-in fade-in duration-300">
            <ActiveComponent />
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default SectionContainer;
