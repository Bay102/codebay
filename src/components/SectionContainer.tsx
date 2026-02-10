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
    <div className="absolute inset-0 overflow-hidden">
      <div
        ref={scrollRef}
        className="absolute inset-x-0 top-20 bottom-0 pt-2 overflow-y-auto md:overflow-hidden overscroll-contain"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeSection}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-x-0 top-0 min-h-full pb-20 md:pb-0"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SectionContainer;
