import type { ReactNode } from "react";
import { SurfaceCard } from "../SurfaceCard";
import { cn } from "../utils";
import type { ProfileCardData } from "./types";

export type ProfileCardVariant = "default" | "compact" | "horizontal";

export interface ProfileCardProps {
  profile: ProfileCardData;
  variant?: ProfileCardVariant;
  /**
   * Optional main href for the card. When provided, consumers are expected
   * to wrap `ProfileCard` in a Next `Link` at the app layer.
   *
   * We keep this as data-only for now so layouts can decide how to wire navigation.
   */
  href?: string | null;
  showBio?: boolean;
  showStats?: boolean;
  showTechStack?: boolean;
  /**
   * Optional follow button slot (e.g. app-provided FollowButton).
   * Rendered in the trailing header area when present.
   */
  followButton?: ReactNode;
  className?: string;
}

function buildInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "CB";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[1]![0]).toUpperCase();
}

function formatFollowerCount(count: number | undefined): string | null {
  if (typeof count !== "number") return null;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M followers`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k followers`;
  if (count === 1) return "1 follower";
  return `${count.toString()} followers`;
}

export function ProfileCard({
  profile,
  variant = "default",
  showBio = true,
  showStats = true,
  showTechStack = false,
  followButton,
  className,
}: ProfileCardProps) {
  const followerLabel = formatFollowerCount(profile.followerCount);

  const baseLayoutClasses =
    variant === "horizontal"
      ? "flex flex-row items-center gap-3"
      : "flex flex-col gap-2";

  return (
    <SurfaceCard
      as="article"
      variant="card"
      className={cn(
        "transition-all hover:shadow-lg hover:border-border/40 hover:bg-card/80",
        baseLayoutClasses,
        className,
      )}
    >
      <div className={cn("flex w-full items-start gap-2", variant === "horizontal" ? "justify-between" : "")}>
        <div className="flex min-w-0 items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/70 text-xs font-medium text-foreground">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={`${profile.name} avatar`}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              buildInitials(profile.name)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{profile.name}</p>
            <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
            {showStats && followerLabel ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">{followerLabel}</p>
            ) : null}
          </div>
        </div>
        {followButton ? <div className="shrink-0">{followButton}</div> : null}
      </div>

      {showBio && profile.bio?.trim() ? (
        <p className="mt-1 line-clamp-3 text-xs leading-6 text-muted-foreground">{profile.bio.trim()}</p>
      ) : null}

      {showTechStack && profile.techStack.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {profile.techStack.slice(0, 4).map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-[10px] font-mono tracking-[0.16em] uppercase text-foreground/90"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </SurfaceCard>
  );
}

