const stats = [
  { value: "10x", label: "Faster Delivery" },
  { value: "50+", label: "Projects Shipped" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "24/7", label: "AI-Powered" }
];

const values = [
  { title: "Speed Without Sacrifice", description: "We leverage AI to move fast, but never at the cost of quality or security." },
  { title: "Transparent Partnership", description: "You're never in the dark. Real-time updates and honest communication, always." },
  { title: "Future-Ready Code", description: "Every line we write is maintainable, scalable, and built for tomorrow." }
];

const AboutSection = () => {
  return (
    <div className="flex w-full min-h-full items-start justify-center px-4 pt-6 pb-10 md:px-8 md:pt-8 md:pb-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Who We Are
          </span>
          <h2 className="font-heading text-3xl text-foreground mt-3 sm:text-4xl lg:text-5xl">
            About CodeBay
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            We're a team of senior engineers and AI specialists who believe professional software 
            development shouldn't take months. We combine deep technical expertise with cutting-edge 
            AI tools to deliver exceptional results at unprecedented speed.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass-nav rounded-2xl p-5 text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="font-display text-2xl font-bold gradient-text sm:text-3xl">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-xs mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="glass-nav rounded-2xl p-6">
          <h3 className="font-display text-lg text-foreground mb-6 text-center">
            Our Principles
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="text-foreground font-medium mb-2">{value.title}</div>
                <div className="text-muted-foreground text-sm leading-relaxed">{value.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
