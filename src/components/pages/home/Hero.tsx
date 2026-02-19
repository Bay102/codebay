import SectionContainer from "./SectionContainer";
import VideoBackground from "./VideoBackground";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HeroProps {
  activeSection: SectionType;
  direction: number;
  videoEnabled?: boolean;
}

const Hero = ({ activeSection, direction, videoEnabled = true }: HeroProps) => {
  const shouldRenderVideo = videoEnabled;

  return (
    <section className="min-h-[100dvh] grid grid-rows-1 overflow-hidden md:min-h-screen">
      {/* Video Background */}
      <VideoBackground
        src="/code.mp4"
        overlay={true}
        enabled={shouldRenderVideo}
      />

      {/* Animated Section Container */}
      <SectionContainer activeSection={activeSection} direction={direction} />
    </section>
  );
};

export default Hero;
