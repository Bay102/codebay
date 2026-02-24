import SectionContainer from "./SectionContainer";
import TechBackground from "./TechBackground";
// import VideoBackground from "./VideoBackground";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HeroProps {
  activeSection: SectionType;
  direction: number;
  /** When restoring video: pass effectsEnabled from HomeHeroController to control autoplay */
  // effectsEnabled?: boolean;
}

const Hero = ({ activeSection, direction }: HeroProps) => {
  return (
    <section className="min-h-[100dvh] grid grid-rows-1 overflow-hidden md:min-h-screen">
      {/* AI-themed Background */}
      <TechBackground />

      {/* Video background – to restore:
          1. Uncomment effectsEnabled in HeroProps and add to destructuring
          2. In HomeHeroController: <Hero ... effectsEnabled={effectsEnabled} />
          3. Uncomment below and set src 
      */}

      {/* <VideoBackground
        src="/path/to/hero-video.mp4"
        overlay
        overlayOpacity={0.4}
        enabled={effectsEnabled}
      /> */}

      {/* Animated Section Container */}
      <SectionContainer activeSection={activeSection} direction={direction} />
    </section>
  );
};

export default Hero;
