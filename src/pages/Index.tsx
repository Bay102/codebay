import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

const sectionOrder: SectionType[] = ["home", "solutions", "products", "resources", "about-us"];

const Index = () => {
  const [activeSection, setActiveSection] = useState<SectionType>("home");
  const [direction, setDirection] = useState(0);

  const handleSectionChange = useCallback((newSection: SectionType) => {
    const currentIndex = sectionOrder.indexOf(activeSection);
    const newIndex = sectionOrder.indexOf(newSection);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveSection(newSection);
  }, [activeSection]);

  return (
    <div className="relative min-h-[100dvh] bg-background">
      <Header activeSection={activeSection} onSectionChange={handleSectionChange} />
      <Hero activeSection={activeSection} direction={direction} />
    </div>
  );
};

export default Index;
