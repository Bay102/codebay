import { ArrowUpRight } from "lucide-react";
import SectionContainer from "./SectionContainer";
import VideoBackground from "./VideoBackground";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HeroProps {
  activeSection: SectionType;
  direction: number;
}

const Hero = ({ activeSection, direction }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden px-6 pb-24 md:pb-12 lg:px-12">
      {/* Video Background */}
      <VideoBackground
        src="/code.mp4"
        overlay={true}
        overlayOpacity={0.6}
      />

      {/* Animated Section Container */}
      <div className="absolute inset-0 z-10">
        <SectionContainer activeSection={activeSection} direction={direction} />
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default Hero;
