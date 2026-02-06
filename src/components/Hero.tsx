import { ArrowUpRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden px-6 pb-12 lg:px-12 lg:pb-20">
      {/* Video/Graphic Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="video-placeholder w-full h-full flex items-center justify-center">
          {/* Placeholder for video/3D graphic */}
          <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full animate-float">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-pink-500/20 blur-3xl animate-pulse-glow" />
            
            {/* Placeholder box */}
            <div className="absolute inset-[20%] glass-nav rounded-3xl flex items-center justify-center">
              <p className="text-muted-foreground text-sm text-center px-4">
                Your video or graphic goes here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16">
          {/* Left: Headline */}
          <div className="flex-1">
            <h1 className="font-display font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] tracking-tight">
              Smarter Innovation
              <br />
              with Web3 & AI
            </h1>
          </div>

          {/* Right: Description & CTA */}
          <div className="lg:max-w-sm">
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
              Building the future of digital innovation by merging Web3 and AI through research, development.
            </p>
            
            <div className="flex items-center gap-2">
              <button className="gradient-btn px-6 py-3 rounded-full text-sm font-medium text-primary-foreground">
                Get Started
              </button>
              <button className="icon-btn w-12 h-12 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
