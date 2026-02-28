"use client";

import { useState, useCallback } from "react";
import Header from "@/components/pages/home/Header";
import Footer from "@/components/Footer";
import HomeSectionController from "@/components/pages/home/HomeSectionController";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

const sectionOrder: SectionType[] = ["home", "solutions", "products", "resources", "about-us"];

const IndexView = () => {
  const [activeSection, setActiveSection] = useState<SectionType>("home");
  const [direction, setDirection] = useState(0);

  const handleSectionChange = useCallback(
    (newSection: SectionType) => {
      const currentIndex = sectionOrder.indexOf(activeSection);
      const newIndex = sectionOrder.indexOf(newSection);
      setDirection(newIndex > currentIndex ? 1 : -1);
      setActiveSection(newSection);
    },
    [activeSection]
  );

  return (
    <div>
      <Header activeSection={activeSection} onSectionChange={handleSectionChange} />
      <HomeSectionController activeSection={activeSection} direction={direction} />
      <Footer />
    </div>
  );
};

export default IndexView;
