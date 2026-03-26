import { FileText, MessagesSquare } from "lucide-react";
import { cn } from "../utils";

type PostTypeBadgeType = "blog" | "discussion";

const postTypeBadgeConfig: Record<
  PostTypeBadgeType,
  {
    label: string;
    Icon: typeof FileText;
    accentClassName: string;
  }
> = {
  blog: {
    label: "Blog",
    Icon: FileText,
    accentClassName: "from-cyan-400/80 to-cyan-300/20",
  },
  discussion: {
    label: "Discussion",
    Icon: MessagesSquare,
    accentClassName: "from-violet-400/80 to-violet-300/20",
  },
};

export type PostTypeBadgeProps = {
  type: PostTypeBadgeType;
  className?: string;
};

export function PostTypeBadge({ type, className }: PostTypeBadgeProps) {
  const { label, Icon, accentClassName } = postTypeBadgeConfig[type];

  return (
    <span className={cn("pointer-events-none absolute right-0 top-0 z-10", className)}>
      <span
        className="relative inline-flex h-7 items-center gap-1 border-b border-l border-border/70 bg-card/90 pl-1.5 pr-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-foreground/90 shadow-[0_8px_20px_-18px_rgba(0,0,0,0.85)] backdrop-blur-md"
        style={{ clipPath: "polygon(6px 0,100% 0,100% 100%,0 100%,0 6px)" }}
        aria-label={`Post type: ${label}`}
      >
        <span className={cn("absolute inset-y-0 left-0 w-px bg-gradient-to-b", accentClassName)} />
        <Icon className="h-3 w-3 shrink-0 text-foreground/80" aria-hidden />
        <span>{label}</span>
      </span>
    </span>
  );
}
