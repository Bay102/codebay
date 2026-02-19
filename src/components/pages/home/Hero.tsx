import SectionContainer from "./SectionContainer";
import TechBackground from "./TechBackground";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HeroProps {
  activeSection: SectionType;
  direction: number;
}

const Hero = ({ activeSection, direction }: HeroProps) => {
  return (
    <section className="min-h-[100dvh] grid grid-rows-1 overflow-hidden md:min-h-screen">
      {/* AI-themed Background */}
      <TechBackground />

      {/* Animated Section Container */}
      <SectionContainer activeSection={activeSection} direction={direction} />
    </section>
  );
};

export default Hero;
