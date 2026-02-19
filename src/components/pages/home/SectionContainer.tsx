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
    filter: "blur(4px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -SLIDE_DISTANCE : SLIDE_DISTANCE,
    filter: "blur(4px)",
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
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

  return (
    <div className="[grid-area:1/1] z-10 h-[100dvh] overflow-hidden bg-background/93 px-3 pt-32 pb-14 backdrop-blur-sm md:px-6 md:pt-28 md:pb-16 lg:px-12 dark:bg-background/88 dark:backdrop-blur">
      <div
        ref={scrollRef}
        className="relative flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain"
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
            className="relative flex-1"
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
