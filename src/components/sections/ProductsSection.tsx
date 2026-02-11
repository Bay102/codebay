import { useCallback, useState } from "react";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Code2,
  FileSearch,
  Rocket,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useConnectForm } from "@/contexts/ConnectFormContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Product = {
  name: string;
  category: string;
  description: string;
  status: "Available" | "Internal";
  detailText: string;
  detailImage: string;
  detailImageAlt: string;
  icon: LucideIcon;
};

const products: Product[] = [
  {
    name: "Virtual CTO",
    category: "Service",
    description:
      "A virtual CTO for your startup, enhanced by AI. Stressed out about your tech needs? We'll handle the heavy lifting.",
    status: "Available",
    icon: Brain,
    detailText: `Bring strategic technical leadership to your startup without the full-time cost. Our Virtual CTO service combines deep engineering expertise with AI augmentation to deliver architecture decisions, technology roadmaps, and team guidance tailored to your stage.

We'll help you make informed decisions on stack selection, scaling strategies, and technical debt—so you can focus on product and customers while we ensure your foundation is solid.`,
    detailImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    detailImageAlt: "Team collaboration and strategy discussion",
  },
  {
    name: "Tech Community",
    category: "Product",
    description:
      "Access a community of senior engineers and AI specialists who are willing to help you with whatever you need in the tech space.",
    status: "Available",
    icon: Users,
    detailText: `Access a community of senior engineers and AI specialists who are willing to help you with whatever you need in the tech space.`,
    detailImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    detailImageAlt: "Community of senior engineers and AI specialists",
  },
  {
    name: "CodeBay Studio",
    category: "Development Platform",
    description:
      "Our internal AI-powered development environment that accelerates every project we build.",
    status: "Internal",
    icon: Code2,
    detailText: `CodeBay Studio is our proprietary development environment that supercharges our engineering workflow. It integrates AI-assisted coding, real-time collaboration, and intelligent project scaffolding into a single cohesive experience.

While currently internal, the platform embodies everything we've learned about building software at speed—context-aware completions, automated testing, and seamless deployment pipelines.`,
    detailImage:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    detailImageAlt: "Code editor and development workspace",
  },
  {
    name: "Rapid Prototyping",
    category: "Service",
    description:
      "Go from idea to interactive prototype in 48 hours. Test your concept before committing.",
    status: "Available",
    icon: Rocket,
    detailText: `Validate your ideas in days, not months. Our rapid prototyping service turns concepts into clickable, interactive prototypes that you can put in front of users and stakeholders.

We use modern low-code and AI tools to compress the prototype-to-feedback cycle, so you can iterate on real user reactions before investing in full development.`,
    detailImage:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    detailImageAlt: "Wireframes and design prototyping",
  },
  {
    name: "AI Code Audit",
    category: "Service",
    description:
      "Comprehensive code review and optimization using AI to identify bottlenecks and security issues.",
    status: "Available",
    icon: FileSearch,
    detailText: `Get a thorough assessment of your codebase with AI-powered analysis. We identify performance bottlenecks, security vulnerabilities, maintainability issues, and optimization opportunities.

Our audit combines automated scanning with human expertise—delivering actionable recommendations prioritized by impact, so you know exactly where to focus your engineering efforts.`,
    detailImage:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
    detailImageAlt: "Code review and analysis",
  },
  {
    name: "Technical Due Diligence",
    category: "Service",
    description:
      "Investor-ready technical assessments. We evaluate codebases, architecture, and team readiness for funding rounds.",
    status: "Available",
    icon: ClipboardCheck,
    detailText: `Prepare for investor scrutiny with a comprehensive technical due diligence report. We assess your codebase quality, architecture scalability, security posture, and team capabilities.

Our reports give investors confidence in your technical foundation and help you address gaps before they become deal-breakers.`,
    detailImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    detailImageAlt: "Analytics and due diligence",
  },
];

const CARDS_PER_PAGE = 4;

interface ProductDetailContentProps {
  product: Product;
  onInquire?: () => void;
}

function ProductDetailContent({
  product,
  onInquire,
}: ProductDetailContentProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Image section */}
      <div className="relative w-full aspect-video sm:aspect-[16/10] overflow-hidden rounded-xl mb-6">
        <img
          src={product.detailImage}
          alt={product.detailImageAlt}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-xl text-foreground sm:text-2xl drop-shadow-sm">
            {product.name}
          </h3>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full mt-1 inline-block",
              product.status === "Available"
                ? "bg-green-500/20 text-green-400"
                : "bg-primary/20 text-primary"
            )}
          >
            {product.status}
          </span>
        </div>
      </div>

      {/* Text section */}
      <div className="flex-1 overflow-y-auto pr-2">
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {product.detailText}
        </p>
        <span className="text-xs text-muted-foreground/60 mt-4 inline-block">
          {product.category}
        </span>
      </div>

      {onInquire && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInquire();
          }}
          className="gradient-btn w-full px-6 py-3 rounded-full text-sm font-medium text-primary-foreground mt-4 shrink-0"
        >
          Inquire Now
        </button>
      )}

    </div>
  );
}

const ProductsSection = () => {
  const { openConnectForm } = useConnectForm();
  const isMobile = useIsMobile();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(products.length / CARDS_PER_PAGE);
  const paginatedProducts = products.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE
  );

  const handleCardClick = useCallback(
    (product: Product) => {
      const isAlreadySelected = selectedProduct?.name === product.name;
      if (isMobile) {
        setSelectedProduct(product);
        setModalOpen(!isAlreadySelected);
      } else {
        setSelectedProduct(isAlreadySelected ? null : product);
      }
    },
    [isMobile, selectedProduct?.name]
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedProduct(null);
    setModalOpen(false);
  }, []);

  return (
    <div className="flex w-full min-h-full items-start justify-center px-4 pt-6 pb-10 md:px-8 md:pt-8 md:pb-8">
      <div
        className={cn(
          "w-full transition-all duration-300",
          selectedProduct && !isMobile ? "max-w-6xl" : "max-w-4xl"
        )}
      >
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Our Offerings
          </span>
          <h2 className="font-display text-3xl text-foreground mt-3 sm:text-4xl lg:text-5xl">
            Products & Services
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Tools and services designed to accelerate your software development
            journey.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:items-stretch">
          {/* Cards column */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div className="space-y-6">
              {paginatedProducts.map((product, index) => {
                const Icon = product.icon;
                return (
                <div
                  key={product.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(product)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCardClick(product);
                    }
                  }}
                  className={cn(
                    "liquid-glass-nav flex flex-col gap-6 rounded-2xl p-7 transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between",
                    selectedProduct?.name === product.name && !isMobile
                      ? "ring-2 ring-primary/50 border-primary/40"
                      : ""
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                  aria-expanded={
                    !isMobile && selectedProduct?.name === product.name
                  }
                  aria-haspopup={isMobile ? "dialog" : undefined}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-xl text-foreground">
                        {product.name}
                      </h3>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          product.status === "Available"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-primary/20 text-primary"
                        )}
                      >
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
                  <button
                    className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform pointer-events-none"
                    aria-hidden
                  >
                    <Icon className="w-4 h-4 text-primary" />
                  </button>
                </div>
              );
              })}
            </div>

            {/* Pagination control - bottom of cards list */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center pt-2">
                <nav
                  className="liquid-glass-nav flex items-center gap-1 rounded-full px-2 py-1.5"
                  aria-label="Browse products"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="icon-btn w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-110"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4 text-primary" />
                  </button>
                  <span className="text-xs text-muted-foreground px-3 tabular-nums">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="icon-btn w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-110"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Detail panel - MD and up, slides in from right */}
          {!isMobile && selectedProduct && (
            <div className="liquid-glass-nav flex min-h-0 w-full flex-col md:w-[360px] lg:w-[400px] shrink-0 rounded-2xl p-6 animate-in slide-in-from-right-2 fade-in duration-300 border border-border/80">
              <div className="flex shrink-0 justify-end mb-2">
                <button
                  onClick={handleCloseDetail}
                  className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-border/50 bg-background/80 backdrop-blur-sm hover:bg-background/95 shadow-lg"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4 text-primary" />
                </button>
              </div>
              <ProductDetailContent
                product={selectedProduct}
                onInquire={openConnectForm}
              />
            </div>
          )}
        </div>


      </div>

      {/* Full-screen modal - SM screens */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="connect-dialog w-[calc(100vw-2rem)] max-w-none h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] rounded-2xl p-0 gap-0 overflow-hidden border-0 [&>button]:absolute [&>button]:right-4 [&>button]:top-4 [&>button]:z-20"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {selectedProduct && (
            <div className="h-full overflow-y-auto p-6 pt-14">
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedProduct.name} - Details</DialogTitle>
              </DialogHeader>
              <ProductDetailContent
                product={selectedProduct}
                onInquire={openConnectForm}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsSection;
