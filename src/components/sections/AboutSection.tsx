import { Zap, Handshake, Code2 } from "lucide-react";
import { useConnectForm } from "@/contexts/ConnectFormContext";

const stats = [
  { value: "10x", label: "Faster Delivery" },
  { value: "50+", label: "Projects Shipped" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "24/7", label: "AI-Powered" }
];

const values = [
  {
    icon: Zap,
    title: "Speed Without Sacrifice",
    description: "We leverage AI to move fast, but never at the cost of quality or security."
  },
  {
    icon: Handshake,
    title: "Transparent Partnership",
    description: "You're never in the dark. Real-time updates and honest communication, always."
  },
  {
    icon: Code2,
    title: "Future-Ready Code",
    description: "Every line we write is maintainable, scalable, and built for tomorrow."
  }
];

const AboutSection = () => {
  const { openConnectForm } = useConnectForm();
  return (
    <div className="flex w-full min-h-full items-start justify-center px-4 pt-6 pb-10 md:px-8 md:pt-5 md:pb-5">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Who We Are
          </span>
          <h2 className="font-heading text-2xl text-foreground mt-3 sm:text-3xl lg:text-4xl">
            About CodeBay
          </h2>
          <p className="text-muted-foreground mt-4 max-w-3xl mx-auto leading-relaxed">
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
          <div className="mb-6 text-center">
            <p className="text-primary/80 mb-2 text-xs font-semibold tracking-[0.18em] uppercase">
              What Drives Us
            </p>
            <h3 className="font-display gradient-text text-xl sm:text-2xl">
              Our Principles
            </h3>
            <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <value.icon className="h-5 w-5" />
                </div>
                <div className="text-foreground font-medium mb-2">{value.title}</div>
                <div className="text-muted-foreground text-sm leading-relaxed">{value.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <button
            onClick={openConnectForm}
            className="gradient-btn px-6 py-3 rounded-full text-sm font-medium text-primary-foreground"
          >
            Get in Touch
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
