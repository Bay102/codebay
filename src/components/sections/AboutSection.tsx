const stats = [
  { value: "$2B+", label: "Total Value Locked" },
  { value: "150+", label: "Partner Projects" },
  { value: "1M+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" }
];

const team = [
  { name: "Alex Chen", role: "CEO & Co-founder" },
  { name: "Sarah Kim", role: "CTO" },
  { name: "Marcus Wei", role: "Head of AI" }
];

const AboutSection = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Who We Are
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mt-3">
            About Nexora
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            We're a team of innovators, engineers, and dreamers building at the intersection 
            of artificial intelligence and decentralized technology. Our mission is to create 
            tools that empower the next billion users to participate in the digital economy.
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

        {/* Team Preview */}
        <div className="glass-nav rounded-2xl p-6">
          <h3 className="font-display text-lg text-foreground mb-4 text-center">
            Leadership Team
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/50 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-foreground font-display text-lg">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-foreground text-sm font-medium">{member.name}</div>
                <div className="text-muted-foreground text-xs">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
