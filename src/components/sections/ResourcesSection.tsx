import { FileText, Video, BookOpen, Users } from "lucide-react";

const resources = [
  {
    icon: FileText,
    title: "Case Studies",
    description: "See how we've helped clients ship faster",
    count: "15+ projects"
  },
  {
    icon: Video,
    title: "Tech Talks",
    description: "Deep dives into AI-powered development",
    count: "Coming soon"
  },
  {
    icon: BookOpen,
    title: "Blog",
    description: "Insights on modern software development",
    count: "Weekly posts"
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with fellow builders",
    count: "Growing"
  }
];

const ResourcesSection = () => {
  return (
    <div className="w-full h-full flex items-start justify-center pt-8 pb-8 px-8 overflow-y-auto">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Learn & Connect
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mt-3">
            Resources
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Insights, case studies, and community to help you build better software.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((resource, index) => (
            <div
              key={resource.title}
              className="glass-nav rounded-2xl p-5 text-center hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <resource.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-base text-foreground mb-1">
                {resource.title}
              </h3>
              <p className="text-muted-foreground text-xs mb-3 leading-relaxed">
                {resource.description}
              </p>
              <span className="text-primary text-xs font-medium">
                {resource.count}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button className="gradient-btn px-6 py-3 rounded-full text-sm font-medium text-primary-foreground">
            View All Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesSection;
