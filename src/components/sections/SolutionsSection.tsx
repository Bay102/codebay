import { Zap, Rocket, Code2, Layers } from "lucide-react";
import { useConnectForm } from "@/contexts/ConnectFormContext";

const solutions = [
  {
    icon: Zap,
    title: "Rapid MVP Development",
    description: "Launch your minimum viable product in weeks, not months. AI-accelerated development without cutting corners."
  },
  {
    icon: Rocket,
    title: "Vibe Code Assistance",
    description: "Professional code assistance from tech professionals for your existing AI created codebase. Stuck on a project? We'll help you get unstuck."
  },
  {
    icon: Code2,
    title: "AI Integration",
    description: "Embed powerful AI capabilities into your existing products or build AI-native solutions from scratch."
  },
  {
    icon: Layers,
    title: "Legacy Modernization",
    description: "Transform outdated systems into modern, maintainable applications at unprecedented speed."
  }
];

const SolutionsSection = () => {
  const { openConnectForm } = useConnectForm();
  return (
    <div className="w-full min-h-full flex items-start justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-6">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            What We Build
          </span>
          <h2 className="font-display text-2xl text-foreground mt-3 sm:text-3xl lg:text-4xl">
            Solutions That Ship Fast
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Professional software development powered by AI, delivering enterprise-quality results at startup speed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-5 sm:grid-cols-2">
          {solutions.map((solution, index) => (
            <div
              key={solution.title}
              className="glass-nav rounded-2xl p-4 hover:border-primary/30 transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-btn flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <solution.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">
                {solution.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {solution.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center my-8">
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

export default SolutionsSection;
