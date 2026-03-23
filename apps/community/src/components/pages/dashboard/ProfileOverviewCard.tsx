import Link from "next/link";
import { ExternalLink, Globe2 } from "lucide-react";
import { BlogPostCard, Tag } from "@codebay/ui";
import type { DashboardBlogPostStats, DashboardProfile, FeaturedProject } from "@/lib/dashboard";
import { blogUrl } from "@/lib/site-urls";
import { ProfileHeaderWithFollow } from "@/components/pages/dashboard/ProfileHeaderWithFollow";
import { mapDashboardBlogPostToBlogPostCardData } from "@/lib/ui-mappers";

type ProfileOverviewCardProps = {
  profile: DashboardProfile;
  posts: DashboardBlogPostStats[];
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

function FeaturedProjectCard({ project }: { project: FeaturedProject }) {
  const hostname = project.url ? getProjectHostname(project.url) : null;
  const faviconUrl = project.url ? getProjectFaviconUrl(project.url) : null;

  return (
    <div className="flex h-full min-h-0 flex-col border border-border/70 bg-background/70 p-2.5">
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
        <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{project.description}</p>
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

export function ProfileOverviewCard({ profile, posts, showEditLink = true, viewerId = null }: ProfileOverviewCardProps) {
  const publishedPosts = posts.filter((post) => post.status === "published");

  const featuredPosts = profile.hasFeaturedPostSelection
    ? publishedPosts.filter((post) => profile.featuredPostSlugs.includes(post.slug))
    : publishedPosts.slice(0, 3);

  const hasFollowStats =
    profile.followerCount !== undefined && profile.followingCount !== undefined;
  const showFollowSection = hasFollowStats && viewerId != null;

  const featuredProjectsList = profile.featuredProjects.slice(0, 3);
  const featuredPostsList = featuredPosts.slice(0, 3);
  const usePairedFeaturedRows = featuredProjectsList.length > 0 && featuredPostsList.length > 0;
  const pairedRowCount = Math.max(featuredProjectsList.length, featuredPostsList.length);

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

      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        {profile.bio?.trim() ? profile.bio : "Add a short bio to personalize your author presence."}
      </p>

      <div className="mt-5 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tech stack</p>
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
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Links</p>
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
        </div>

        {usePairedFeaturedRows ? (
          <>
            {/*
              Below md, a 2-col grid becomes one column: headers stack, then each "pair" row
              stacks project+post and empty cells use hidden md:flex — wrong order and missing cards.
              Use full-width stacked sections on small screens; paired equal-height rows from md up.
            */}
            <div className="space-y-5 md:hidden">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured projects</p>
                <div className="mt-2 space-y-1.5">
                  {featuredProjectsList.map((project) => (
                    <FeaturedProjectCard key={project.title} project={project} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured posts</p>
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
              </div>
            </div>

            <div className="hidden md:block">
              <div className="grid gap-5 md:grid-cols-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured projects</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured posts</p>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {Array.from({ length: pairedRowCount }, (_, index) => {
                  const project = featuredProjectsList[index];
                  const post = featuredPostsList[index];
                  const href =
                    post != null ? `${blogUrl}/${buildAuthorSegment(post.authorName)}/${post.slug}` : "";
                  const cardData = post != null ? mapDashboardBlogPostToBlogPostCardData(post) : null;

                  return (
                    <div
                      key={`featured-pair-${index}`}
                      className="grid gap-5 md:grid-cols-2 md:items-stretch"
                    >
                      <div className={`min-h-0 flex flex-col ${project ? "" : "hidden md:flex"}`}>
                        {project ? <FeaturedProjectCard project={project} /> : <div className="min-h-0 flex-1" aria-hidden />}
                      </div>
                      <div className={`min-h-0 flex flex-col ${post ? "" : "hidden md:flex"}`}>
                        {post && cardData ? (
                          <BlogPostCard
                            post={cardData}
                            href={href}
                            variant="compact"
                            showAuthor={false}
                            showDate
                            showEngagement
                            showTags={false}
                            className="h-full min-h-0 bg-background/70"
                          />
                        ) : (
                          <div className="min-h-0 flex-1" aria-hidden />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured projects</p>
              {profile.featuredProjects.length > 0 ? (
                <div className="mt-2 space-y-1.5">
                  {featuredProjectsList.map((project) => (
                    <FeaturedProjectCard key={project.title} project={project} />
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No featured projects yet.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured posts</p>
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
        )}
      </div>
    </article>
  );
}
