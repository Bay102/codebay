import { ArrowUpRight } from "lucide-react";
import SectionContainer from "./SectionContainer";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HeroProps {
  activeSection: SectionType;
  direction: number;
}

const Hero = ({ activeSection, direction }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden px-6 pb-12 lg:px-12 lg:pb-20">
      {/* Animated Section Container */}
      <div className="absolute inset-0 flex items-center justify-center pt-20">
        <SectionContainer activeSection={activeSection} direction={direction} />
      </div>

      {/* Content - Only show on home */}
      {activeSection === "home" && (
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16">
            {/* Left: Headline */}
            <div className="flex-1">
              <h1 className="font-display font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] tracking-tight">
                AI-Powered Software
                <br />
                <span className="gradient-text">Built at Insane Speed</span>
              </h1>
            </div>

            {/* Right: Description & CTA */}
            <div className="lg:max-w-sm">
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                We're a tech agency that builds professional-grade software using AI, delivering weeks of work in days without compromising quality.
              </p>
              
              <div className="flex items-center gap-2">
                <button className="gradient-btn px-6 py-3 rounded-full text-sm font-medium text-primary-foreground">
                  Start Your Project
                </button>
                <button className="icon-btn w-12 h-12 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
