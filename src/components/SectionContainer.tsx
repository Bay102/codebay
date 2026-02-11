import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SolutionsSection from "./sections/SolutionsSection";
import ProductsSection from "./sections/ProductsSection";
import ResourcesSection from "./sections/ResourcesSection";
import AboutSection from "./sections/AboutSection";
import ChatSection from "./sections/ChatSection";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface SectionContainerProps {
  activeSection: SectionType;
  direction: number;
}

const sections: Record<SectionType, React.ComponentType> = {
  home: ChatSection,
  solutions: SolutionsSection,
  products: ProductsSection,
  resources: ResourcesSection,
  "about-us": AboutSection,
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  }),
};

const SectionContainer = ({ activeSection, direction }: SectionContainerProps) => {
  const ActiveComponent = sections[activeSection];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

  return (
    <div className="[grid-area:1/1] z-10 overflow-hidden px-6 lg:px-12 pt-36 md:pt-28 pb-6 md:pb-8">
      <div
        ref={scrollRef}
        className="h-full flex flex-col overflow-y-auto overscroll-contain md:overflow-hidden"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeSection}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative flex-1"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SectionContainer;
