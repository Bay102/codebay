import { lazy, Suspense, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const SLIDE_DISTANCE = 40;

const sectionVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? SLIDE_DISTANCE : -SLIDE_DISTANCE,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -SLIDE_DISTANCE : SLIDE_DISTANCE,
  }),
};

const sectionTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as const,
};

const SectionContainer = ({ activeSection, direction }: SectionContainerProps) => {
  const ActiveComponent = sections[activeSection];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll position instantly when switching sections to avoid
    // fighting against the Framer Motion transition animation.
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [activeSection]);

  return (
    <div className="[grid-area:1/1] relative z-10 h-[100dvh] overflow-hidden bg-background/66 px-3 pt-28 pb-14 backdrop-blur-none md:px-6 md:pb-16 md:pt-[90px] lg:px-12 dark:bg-background/72 dark:backdrop-blur-none">
      <div className="tech-section-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        ref={scrollRef}
        className="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeSection}
            custom={direction}
            variants={sectionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={sectionTransition}
            className="relative flex-1 will-change-transform"
          >
            <Suspense fallback={<div className="relative flex-1" />}>
              <ActiveComponent />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SectionContainer;
