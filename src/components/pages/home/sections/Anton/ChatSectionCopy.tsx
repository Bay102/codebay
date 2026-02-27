import { ArrowRight, ChartBarBig, Code2, Globe, ShieldCheck, Smartphone, Sparkles, Zap } from "lucide-react";

const CAPABILITIES = [
  { icon: Smartphone, label: "Mobile Apps", color: "text-ai-accent" },
  { icon: ChartBarBig, label: "Internal Tools", color: "text-green-500" },
  { icon: Globe, label: "Websites", color: "text-ai-accent" },
  { icon: Code2, label: "Custom Software", color: "text-primary" },
  { icon: Sparkles, label: "AI Integration Services", color: "text-ai-accent" },
] as const;

const OUTCOMES = [
  { icon: ArrowRight, label: "Launch Faster", sub: "MVPs in weeks, not months" },
  { icon: ShieldCheck, label: "Enterprise-Grade Software", sub: "Production-ready quality" },
  { icon: Zap, label: "AI-Accelerated Development", sub: "Speed without compromise" },
] as const;

export const ChatSectionCopy = () => (
  <div className="flex flex-col gap-4 md:gap-5">
    <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
      Software Development
      <span
        aria-hidden="true"
        className="my-1.5 block h-px w-full max-w-xs bg-gradient-to-r from-primary/80 to-transparent sm:my-2 sm:max-w-sm"
      />
      <span className="gradient-text">Mobile · Web · Internal Tools</span>
    </h1>
    <p className="leading-relaxed text-sm text-foreground/90 sm:text-base">
      CodeBay helps startups and businesses build production-grade web apps, mobile apps, and custom software faster
      with AI-assisted delivery.
    </p>

    <div className="flex flex-wrap gap-2">
      {CAPABILITIES.map(({ icon: Icon, label, color }, i) => (
        <div
          key={label}
          className="group inline-flex animate-in fade-in slide-in-from-bottom-2 items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1.5 backdrop-blur-sm transition-all duration-300 hover:border-ai-accent/30 hover:bg-ai-accent/10"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <Icon className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${color}`} />
          <span className="text-[11px] font-medium text-foreground/90 sm:text-xs">{label}</span>
        </div>
      ))}
    </div>

    <div className="flex flex-col gap-2 pt-0 md:gap-2.5 md:pt-1">
      {OUTCOMES.map(({ icon: Icon, label, sub }, i) => (
        <div
          key={label}
          className="flex animate-in fade-in slide-in-from-left-3 items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 transition-all duration-300 hover:border-primary/20 hover:bg-primary/5"
          style={{ animationDelay: `${200 + i * 100}ms` }}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/15">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
