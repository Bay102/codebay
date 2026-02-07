import { ArrowUpRight } from "lucide-react";

const products = [
  {
    name: "CodeBay Studio",
    category: "Development Platform",
    description: "Our internal AI-powered development environment that accelerates every project we build.",
    status: "Internal"
  },
  {
    name: "Rapid Prototyping",
    category: "Service",
    description: "Go from idea to interactive prototype in 48 hours. Test your concept before committing.",
    status: "Available"
  },
  {
    name: "AI Code Audit",
    category: "Service",
    description: "Comprehensive code review and optimization using AI to identify bottlenecks and security issues.",
    status: "Available"
  }
];

const ProductsSection = () => {
  return (
    <div className="w-full h-full flex items-start justify-center pt-8 pb-8 px-8 overflow-y-auto">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Our Offerings
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mt-3">
            Products & Services
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Tools and services designed to accelerate your software development journey.
          </p>
        </div>

        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={product.name}
              className="glass-nav rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display text-xl text-foreground">
                    {product.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    product.status === "Available" 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-primary/20 text-primary"
                  }`}>
                    {product.status}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {product.description}
                </p>
                <span className="text-xs text-muted-foreground/60 mt-1 inline-block">
                  {product.category}
                </span>
              </div>
              <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
