const HomeSection = () => {
  return (
    <div className="relative w-full h-full flex items-start justify-center pt-8">
      {/* Video/Graphic Placeholder */}
      <div className="video-placeholder w-full h-full flex items-center justify-center">
        <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full animate-float">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl animate-pulse-glow" />
          
          {/* Placeholder box */}
          <div className="absolute inset-[20%] glass-nav rounded-3xl flex items-center justify-center">
            <p className="text-muted-foreground text-sm text-center px-4">
              Your video or graphic goes here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;
