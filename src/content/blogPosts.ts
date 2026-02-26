export interface BlogPostSection {
  heading: string;
  paragraphs: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  authorName: string;
  tags: string[];
  sections: BlogPostSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "ai-product-discovery-sprints",
    title: "How AI Product Discovery Sprints Cut 6 Weeks From Delivery",
    description:
      "A practical breakdown of using AI-assisted product discovery to move from rough idea to validated scope in days instead of weeks.",
    excerpt:
      "Learn a repeatable discovery workflow that combines user interviews, AI-assisted requirements drafting, and technical risk mapping.",
    publishedAt: "2026-02-12",
    updatedAt: "2026-02-12",
    readTimeMinutes: 7,
    authorName: "CodeBay Team",
    tags: ["AI Development", "Product Discovery", "Delivery Speed"],
    sections: [
      {
        heading: "Why Discovery Usually Bottlenecks",
        paragraphs: [
          "Most teams do discovery in serial: stakeholder input, then requirements, then technical design. That creates avoidable handoff delays and stale assumptions before engineering starts.",
          "A sprint model works better when product, design, and engineering align around one decision log. AI helps by generating first-pass requirements, edge-case checklists, and acceptance criteria while the team is still in the room."
        ]
      },
      {
        heading: "The 5-Day AI Discovery Framework",
        paragraphs: [
          "Day 1 focuses on user pain points and business constraints. Day 2 creates solution concepts and ranks them by feasibility. Day 3 produces a technical architecture draft. Day 4 stress-tests risk areas. Day 5 finalizes roadmap and delivery phases.",
          "By the end of the sprint, you have an implementation-ready brief: measurable goals, scoped milestones, and clear trade-offs."
        ]
      },
      {
        heading: "What Teams Should Measure",
        paragraphs: [
          "Track three metrics: time from kickoff to signed scope, number of requirement changes during build, and cycle time from ticket start to production.",
          "When those trend downward together, discovery quality is improving. The goal is not to remove uncertainty, but to resolve the highest-risk uncertainty early."
        ]
      }
    ]
  },
  {
    slug: "building-seo-friendly-apps-with-nextjs",
    title: "Building SEO-Friendly Web Apps With Next.js and Structured Data",
    description:
      "A technical guide to metadata, internal linking, and schema markup patterns that increase discoverability for modern web apps.",
    excerpt:
      "Implement practical SEO foundations in Next.js: metadata APIs, semantic headings, crawlable routes, and JSON-LD for richer search results.",
    publishedAt: "2026-01-29",
    updatedAt: "2026-02-04",
    readTimeMinutes: 8,
    authorName: "CodeBay Team",
    tags: ["SEO", "Next.js", "Structured Data"],
    sections: [
      {
        heading: "Start With Crawlable Information Architecture",
        paragraphs: [
          "Search engines still depend on clean URL structures and clear internal links. Keep key content on server-rendered routes and avoid requiring user interaction before important text appears.",
          "For blogs, use stable slugs, consistent heading hierarchy, and topic clusters that cross-link related posts."
        ]
      },
      {
        heading: "Use the Metadata API Intentionally",
        paragraphs: [
          "Every page should provide unique title, description, canonical URL, and Open Graph fields. Treat these as part of your content strategy, not as boilerplate.",
          "When metadata mirrors user intent, click-through rates improve even before rankings change."
        ]
      },
      {
        heading: "Add JSON-LD for Context",
        paragraphs: [
          "Structured data helps search engines understand what your page represents. For blogs, define Blog and BlogPosting entities with publication dates, author, and headline fields.",
          "Schema does not guarantee rich results, but it reduces ambiguity and improves eligibility."
        ]
      }
    ]
  },
  {
    slug: "shipping-mvp-features-with-confidence",
    title: "Shipping MVP Features With Confidence: A Risk-First Playbook",
    description:
      "How to prioritize, implement, and validate MVP features while reducing rework and protecting launch timelines.",
    excerpt:
      "A lightweight framework for deciding what to build now, what to defer, and how to instrument MVP features for real-world learning.",
    publishedAt: "2025-12-18",
    updatedAt: "2026-01-10",
    readTimeMinutes: 6,
    authorName: "CodeBay Team",
    tags: ["MVP", "Product Engineering", "Execution"],
    sections: [
      {
        heading: "Scope by Risk, Not by Wish List",
        paragraphs: [
          "Teams often prioritize by stakeholder volume instead of outcome risk. A better approach is to rank work by uncertainty: technical risk, adoption risk, and operational risk.",
          "Build the feature slice that proves your core value proposition with the least implementation surface area."
        ]
      },
      {
        heading: "Instrument Before You Launch",
        paragraphs: [
          "Each MVP feature should ship with explicit success events. If you cannot measure onboarding completion, activation, and retention signals, you cannot evaluate the release.",
          "The fastest teams treat analytics and event definitions as part of feature design, not a follow-up task."
        ]
      },
      {
        heading: "Create a Tight Learning Loop",
        paragraphs: [
          "Plan review checkpoints at one week, two weeks, and one month post-launch. Use those checkpoints to prune low-impact work and accelerate what users adopt.",
          "Confidence comes from learning velocity: how quickly you can turn production behavior into product decisions."
        ]
      }
    ]
  }
];

export const blogPostsByDate = [...blogPosts].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt)
);

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
