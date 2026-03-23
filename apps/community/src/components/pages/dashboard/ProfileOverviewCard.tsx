import Link from "next/link";
import { ExternalLink, FileText, Globe2, MessageSquareText } from "lucide-react";
import { BlogPostCard, Tag } from "@codebay/ui";
import type { DashboardBlogPostStats, DashboardProfile, FeaturedProject } from "@/lib/dashboard";
import { blogUrl } from "@/lib/site-urls";
import { ProfileHeaderWithFollow } from "@/components/pages/dashboard/ProfileHeaderWithFollow";
import { mapDashboardBlogPostToBlogPostCardData } from "@/lib/ui-mappers";
import type { DiscussionListItem } from "@/lib/discussions";

type ProfileOverviewCardProps = {
  profile: DashboardProfile;
  posts: DashboardBlogPostStats[];
  discussions: DiscussionListItem[];
  showEditLink?: boolean;
  /** Current viewer user id (for Follow button and follow stats). When omitted, follow section is hidden. */
  viewerId?: string | null;
};

function buildInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "CB";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
}

function buildAuthorSegment(authorName: string): string {
  const base = authorName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "author";
}

function getProjectHostname(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, "");
    return hostname || null;
  } catch {
    return null;
  }
}

function getProjectFaviconUrl(url: string): string | null {
  const hostname = getProjectHostname(url);
  if (!hostname) return null;

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
}

type ProfileActivityFeedItem =
  | {
      id: string;
      kind: "discussion";
      title: string;
      href: string;
      createdAt: string;
      metricLabel: string;
      metricValue: number;
      actionText: string;
      ctaText: string;
    }
  | {
      id: string;
      kind: "blog";
      title: string;
      href: string;
      createdAt: string;
      metricLabel: string;
      metricValue: number;
      actionText: string;
      ctaText: string;
    };

function formatActivityDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const minuteMs = 60_000;
  const hourMs = 3_600_000;
  const dayMs = 86_400_000;

  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.floor(diffMs / minuteMs));
    return `${minutes}m ago`;
  }
  if (diffMs < dayMs) {
    const hours = Math.max(1, Math.floor(diffMs / hourMs));
    return `${hours}h ago`;
  }
  if (diffMs < dayMs * 7) {
    const days = Math.max(1, Math.floor(diffMs / dayMs));
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function buildProfileActivityFeedItems(
  posts: DashboardBlogPostStats[],
  discussions: DiscussionListItem[]
): ProfileActivityFeedItem[] {
  const recentDiscussions: ProfileActivityFeedItem[] = discussions.slice(0, 6).map((discussion) => ({
    id: `discussion-${discussion.id}`,
    kind: "discussion",
    title: discussion.title,
    href: `/discussions/${discussion.slug}`,
    createdAt: discussion.createdAt,
    metricLabel: "comments",
    metricValue: discussion.commentCount,
    actionText: "started a discussion",
    ctaText: "View discussion"
  }));

  const recentPosts: ProfileActivityFeedItem[] = posts
    .filter((post) => post.status === "published")
    .slice(0, 6)
    .map((post) => ({
      id: `post-${post.id}`,
      kind: "blog",
      title: post.title,
      href: `${blogUrl}/${buildAuthorSegment(post.authorName)}/${post.slug}`,
      createdAt: post.publishedAt ?? post.updatedAt ?? post.createdAt ?? "",
      metricLabel: "views",
      metricValue: post.views,
      actionText: "published a blog post",
      ctaText: "View post"
    }));

  return [...recentDiscussions, ...recentPosts]
    .filter((item) => item.createdAt.trim().length > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);
}

function FeaturedProjectCard({ project }: { project: FeaturedProject }) {
  const hostname = project.url ? getProjectHostname(project.url) : null;
  const faviconUrl = project.url ? getProjectFaviconUrl(project.url) : null;

  return (
    <div className="flex h-full min-h-0 flex-col border border-border/70 bg-background/70 p-3 sm:p-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{project.title}</p>
        {faviconUrl ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card/80">
            <img
              src={faviconUrl}
              alt=""
              aria-hidden="true"
              className="h-4 w-4 rounded-sm object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card/80 text-muted-foreground">
            <Globe2 className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      {project.description ? (
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{project.description}</p>
      ) : null}
      {project.url ? (
        <div className="mt-auto pt-2">
          <Link
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-md border border-border/70 bg-card px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt=""
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 rounded-sm object-contain"
                loading="lazy"
              />
            ) : (
              <Globe2 className="h-3.5 w-3.5 shrink-0" />
            )}
            {hostname ? <span className="truncate text-muted-foreground">{hostname}</span> : null}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function SectionHeading({ children, className = "" }: { children: string; className?: string }) {
  return (
    <p
      className={`flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/95 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary/80" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function ProfileOverviewCard({
  profile,
  posts,
  discussions,
  showEditLink = true,
  viewerId = null
}: ProfileOverviewCardProps) {
  const publishedPosts = posts.filter((post) => post.status === "published");
  const featuredPosts = profile.hasFeaturedPostSelection
    ? publishedPosts.filter((post) => profile.featuredPostSlugs.includes(post.slug))
    : publishedPosts.slice(0, 3);

  const hasFollowStats =
    profile.followerCount !== undefined && profile.followingCount !== undefined;
  const showFollowSection = hasFollowStats && viewerId != null;

  const featuredProjectsList = profile.featuredProjects.slice(0, 3);
  const featuredPostsList = featuredPosts.slice(0, 3);
  const activityFeedItems = buildProfileActivityFeedItems(publishedPosts, discussions);

  const profileActionLinks = (
    <>
      <Link
        href={`/blog/${profile.username}`}
        className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary/70"
      >
        View blog
      </Link>
      {showEditLink ? (
        <>
          <Link
            href={`/${profile.username}`}
            className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary/70"
          >
            View public profile
          </Link>
          <Link
            href="/dashboard/profile"
            className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary/70"
          >
            Edit profile
          </Link>
        </>
      ) : null}
    </>
  );

  return (
    <article className="border border-border/70 bg-card/70 p-5 sm:p-6 md:pt-6">
      {showFollowSection ? (
        <ProfileHeaderWithFollow
          profileId={profile.id}
          username={profile.username}
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          initialFollowerCount={profile.followerCount ?? 0}
          initialFollowingCount={profile.followingCount ?? 0}
          initialIsFollowing={profile.isFollowing}
          showEditLink={showEditLink}
          viewerId={viewerId}
          showFollowSection={true}
          actionLinks={profileActionLinks}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Profile</h2>
            <div className="flex flex-wrap items-center justify-end gap-2">{profileActionLinks}</div>
          </div>

          <div className="mt-4">
            <div className="flex items-start gap-4">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={`${profile.name} avatar`} className="h-14 w-14 rounded-full border border-border/70 object-cover shrink-0" />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border/70 bg-secondary text-sm font-semibold">
                  {buildInitials(profile.name)}
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-foreground">{profile.name}</p>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
            </div>
          </div>
        </>
      )}

      <p className="mt-4 text-sm leading-7 text-muted-foreground md:max-w-[calc(50%-0.75rem)]">
        {profile.bio?.trim() ? profile.bio : "Add a short bio to personalize your author presence."}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <SectionHeading>Tech stack</SectionHeading>
            {profile.techStack.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.techStack.map((item) => (
                  <Tag key={item} variant="tech">
                    {item}
                  </Tag>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No technologies added yet.</p>
            )}
            <SectionHeading className="mt-6">Links</SectionHeading>
            {profile.profileLinks.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.profileLinks.map((link) => {
                  const faviconUrl = getProjectFaviconUrl(link.url);
                  const ariaLabel =
                    link.label.trim() ||
                    getProjectHostname(link.url) ||
                    "External link";

                  return (
                    <Link
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={ariaLabel}
                      title={ariaLabel}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-border/80 bg-background text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-[3px] border border-border/60 bg-card/80">
                        {faviconUrl ? (
                          <img
                            src={faviconUrl}
                            alt=""
                            aria-hidden="true"
                            className="h-3.5 w-3.5 rounded-[2px] object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No links added yet.</p>
            )}
          </div>

          <div>
            <SectionHeading>Featured projects</SectionHeading>
            {profile.featuredProjects.length > 0 ? (
              <div className="mt-2 space-y-2">
                {featuredProjectsList.map((project) => (
                  <FeaturedProjectCard key={project.title} project={project} />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No featured projects yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <SectionHeading>Recent activity</SectionHeading>
            <div className="mt-2 border border-border/70 bg-background/70 p-2.5 sm:p-3.5">
              {activityFeedItems.length > 0 ? (
                <div className="space-y-2.5 md:max-h-[24rem] md:overflow-y-auto md:pr-1">
                  {activityFeedItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="group block border border-border/60 bg-card/70 p-3 transition-colors hover:border-primary/35 sm:p-3.5"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/80">
                          {item.kind === "discussion" ? (
                            <MessageSquareText className="h-3.5 w-3.5 text-primary/90" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-primary/90" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px]">
                            <span className="font-semibold text-foreground">{profile.name}</span>
                            <span className="text-muted-foreground">{item.actionText}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">{formatActivityDate(item.createdAt)}</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                            {item.title}
                          </p>
                          <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
                            <span className="text-[11px] text-muted-foreground">
                              {item.metricValue} {item.metricLabel}
                            </span>
                            <span className="text-[11px] font-medium text-primary transition-opacity group-hover:opacity-85">
                              {item.ctaText}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent activity yet. New discussions and published posts will appear here.
                </p>
              )}
            </div>
          </div>

          <div>
            <SectionHeading>Featured posts</SectionHeading>
            {featuredPosts.length > 0 ? (
              <div className="mt-2 space-y-2">
                {featuredPostsList.map((post) => {
                  const href = `${blogUrl}/${buildAuthorSegment(post.authorName)}/${post.slug}`;
                  const cardData = mapDashboardBlogPostToBlogPostCardData(post);
                  return (
                    <BlogPostCard
                      key={post.id}
                      post={cardData}
                      href={href}
                      variant="compact"
                      showAuthor={false}
                      showDate
                      showEngagement
                      showTags={false}
                      className="bg-background/70"
                    />
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No featured posts yet.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
