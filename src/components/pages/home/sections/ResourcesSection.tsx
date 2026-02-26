import { FileText, Video, BookOpen, Users, LayoutTemplate, Mail, GitBranch, Github, Brain } from "lucide-react";

const resources = [
  {
    icon: FileText,
    title: "Case Studies",
    description: "Real-world examples from MVPs to enterprise systems",
    count: "15+ projects"
  },
  {
    icon: BookOpen,
    title: "Blog",
    description: "Practical guides, patterns, and lessons from production",
    count: "Weekly posts"
  },
  {
    icon: Video,
    title: "Tech Talks",
    description: "Live workshops and demos on AI-powered workflows",
    count: "Coming soon"
  },
  {
    icon: Users,
    title: "Community",
    description: "Discord, office hours, and events for AI builders",
    count: "Growing"
  },
  {
    icon: Brain,
    title: "Vibe Assistance",
    description: "Vibe coding a project? View common roadblocks",
    count: "View Roadblocks"
  },
  {
    icon: Mail,
    title: "Newsletter",
    description: "Weekly insights on AI dev and shipping faster",
    count: "Free"
  },
  {
    icon: GitBranch,
    title: "Changelog",
    description: "Latest product updates and feature releases",
    count: "Updated weekly"
  },
  {
    icon: Github,
    title: "Open Source",
    description: "Tools and libraries we build and maintain",
    count: "On GitHub"
  }
];

const ResourcesSection = () => {
  return (
    <div className="flex w-full min-h-full items-start justify-center px-4 pt-6 pb-10 md:px-8 md:pt-8 md:pb-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Learn & Connect
          </span>
          <h2 className="font-display text-3xl text-foreground mt-3 sm:text-4xl lg:text-5xl">
            Resources
          </h2>
          <p className="mt-4 max-w-xl mx-auto light:text-muted-foreground dark:text-foreground">
            Insights, case studies, and community to help you build better software.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {resources.map((resource, index) => (
            <div
              key={resource.title}
              className="liquid-glass-nav home-card-surface rounded-2xl p-6 text-center hover:border-primary/30 hover:scale-105 transition-all duration-300 group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <resource.icon className="w-8 h-8 text-primary" />
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
      </div>
    </div>
  );
};

export default ResourcesSection;
