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
    <div className="w-full h-full flex items-start justify-center pt-8 pb-8 px-8 overflow-y-auto">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Who We Are
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mt-3">
            About CodeBay
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            We're a team of senior engineers and AI specialists who believe professional software 
            development shouldn't take months. We combine deep technical expertise with cutting-edge 
            AI tools to deliver exceptional results at unprecedented speed.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass-nav rounded-2xl p-5 text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="font-display text-2xl md:text-3xl gradient-text font-bold">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
