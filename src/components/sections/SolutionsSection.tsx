import { Zap, Shield, Globe, Cpu } from "lucide-react";

const solutions = [
  {
    icon: Zap,
    title: "Smart Contracts",
    description: "Automated, trustless agreements powered by blockchain technology."
  },
  {
    icon: Shield,
    title: "Secure Infrastructure",
    description: "Enterprise-grade security for your digital assets and data."
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Decentralized systems spanning across continents."
  },
  {
    icon: Cpu,
    title: "AI Integration",
    description: "Machine learning models optimized for Web3 applications."
  }
];

const SolutionsSection = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            What We Offer
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mt-3">
            Innovative Solutions
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Cutting-edge technology solutions designed for the decentralized future.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {solutions.map((solution, index) => (
            <div
              key={solution.title}
              className="glass-nav rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
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
      </div>
    </div>
  );
};

export default SolutionsSection;
