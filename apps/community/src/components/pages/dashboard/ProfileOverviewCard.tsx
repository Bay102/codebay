import Link from "next/link";
import { BlogPostCard, Tag } from "@codebay/ui";
import type { DashboardBlogPostStats, DashboardProfile } from "@/lib/dashboard";
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

export function ProfileOverviewCard({ profile, posts, showEditLink = true, viewerId = null }: ProfileOverviewCardProps) {
  const publishedPosts = posts.filter((post) => post.status === "published");

  const featuredPosts = profile.hasFeaturedPostSelection
    ? publishedPosts.filter((post) => profile.featuredPostSlugs.includes(post.slug))
    : publishedPosts.slice(0, 3);

  const hasFollowStats =
    profile.followerCount !== undefined && profile.followingCount !== undefined;
  const showFollowSection = hasFollowStats && viewerId != null;

  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Profile</h2>
        {showEditLink ? (
          <div className="flex items-center gap-2">
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
          </div>
        ) : null}
      </div>

      <div className="mt-4">
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
          />
        ) : (
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
        )}
      </div>

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
                  <Tag key={item} variant="pill">
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
                {profile.profileLinks.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-sm border border-border/80 bg-background px-3 py-1 text-xs font-medium text-foreground underline-offset-4 hover:border-primary/50 hover:text-primary hover:underline"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No links added yet.</p>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured projects</p>
            {profile.featuredProjects.length > 0 ? (
              <div className="mt-2 space-y-2">
                {profile.featuredProjects.slice(0, 3).map((project) => (
                  <div key={project.title} className="rounded-xl border border-border/70 bg-background/70 p-3">
                    <p className="text-sm font-medium text-foreground">{project.title}</p>
                    {project.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">{project.description}</p>
                    ) : null}
                    {project.url ? (
                      <Link
                        href={project.url}
                        className="mt-2 inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        View project
                      </Link>
                    ) : null}
                  </div>
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
                {featuredPosts.slice(0, 3).map((post) => {
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
