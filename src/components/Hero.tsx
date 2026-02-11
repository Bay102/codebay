import SectionContainer from "./SectionContainer";
import VideoBackground from "./VideoBackground";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HeroProps {
  activeSection: SectionType;
  direction: number;
}

const Hero = ({ activeSection, direction }: HeroProps) => {
  return (
    <section className="min-h-[100dvh] md:min-h-screen grid grid-rows-1 overflow-hidden">
      {/* Video Background */}
      <VideoBackground
        src="/code.mp4"
        overlay={true}
        overlayOpacity={0.6}
      />

      {/* Animated Section Container */}
      <SectionContainer activeSection={activeSection} direction={direction} />
    </section>
  );
};

export default Hero;
