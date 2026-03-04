"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { TablesUpdate } from "@/lib/database";
import type { DashboardBlogPostStats, DashboardProfile, FeaturedProject, ProfileLink } from "@/lib/dashboard";
import { useAuth } from "@/contexts/AuthContext";

type ProfileSettingsFormProps = {
  profile: DashboardProfile;
  blogPosts: DashboardBlogPostStats[];
};

function featuredProjectsToInput(projects: FeaturedProject[]): string {
  return projects
    .map((project) => [project.title, project.url ?? "", project.description].join(" | "))
    .join("\n");
}

function parseFeaturedProjects(input: string): FeaturedProject[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [titlePart = "", urlPart = "", descriptionPart = ""] = line.split("|").map((part) => part.trim());
      const title = titlePart;
      if (!title) {
        return null;
      }

      const normalizedUrl = !urlPart ? null : /^https?:\/\//i.test(urlPart) ? urlPart : `https://${urlPart}`;
      return {
        title,
        url: normalizedUrl,
        description: descriptionPart
      } satisfies FeaturedProject;
    })
    .filter((item): item is FeaturedProject => item !== null);
}

function profileLinksToInput(links: ProfileLink[]): string {
  return links
    .map((link) => [link.label, link.url].join(" | "))
    .join("\n");
}

function parseProfileLinksInput(input: string): ProfileLink[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelPart = "", urlPart = ""] = line.split("|").map((part) => part.trim());
      const label = labelPart;
      if (!label) {
        return null;
      }

      const normalizedUrl = !urlPart ? null : /^https?:\/\//i.test(urlPart) ? urlPart : `https://${urlPart}`;
      if (!normalizedUrl) {
        return null;
      }

      return {
        label,
        url: normalizedUrl
      } satisfies ProfileLink;
    })
    .filter((item): item is ProfileLink => item !== null);
}

export function ProfileSettingsForm({ profile, blogPosts }: ProfileSettingsFormProps) {
  const router = useRouter();
  const { supabase, session } = useAuth();

  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [techStackInput, setTechStackInput] = useState(profile.techStack.join(", "));
  const [featuredProjectsInput, setFeaturedProjectsInput] = useState(featuredProjectsToInput(profile.featuredProjects));
  const [profileLinksInput, setProfileLinksInput] = useState(profileLinksToInput(profile.profileLinks));
  const [featuredPostSlugs, setFeaturedPostSlugs] = useState<string[]>(profile.featuredPostSlugs);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!supabase || !session) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    const techStack = techStackInput
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    const featuredProjects = parseFeaturedProjects(featuredProjectsInput);
    const profileLinks = parseProfileLinksInput(profileLinksInput);

    setIsSaving(true);
    let nextAvatarUrl: string | null = avatarUrl.trim() || null;

    if (avatarFile) {
      const userId = session.user.id;
      const fileExtension = avatarFile.name.split(".").pop()?.toLowerCase() || "png";
      const objectPath = `${userId}/avatar-${Date.now()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("community-profile-avatars")
        .upload(objectPath, avatarFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: avatarFile.type || undefined
        });

      if (uploadError) {
        setIsSaving(false);
        setError(uploadError.message ?? "Unable to upload profile image.");
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("community-profile-avatars").getPublicUrl(objectPath);
      nextAvatarUrl = publicUrlData.publicUrl;
    }

    const basePayload: TablesUpdate<"community_users"> = {
      name: name.trim() || profile.name,
      username: username.trim().toLowerCase() || profile.username,
      bio: bio.trim() || null,
      avatar_url: nextAvatarUrl,
      tech_stack: techStack,
      featured_projects: featuredProjects as unknown as TablesUpdate<"community_users">["featured_projects"]
    };

    const payload = {
      ...(basePayload as unknown as Record<string, unknown>),
      profile_links: profileLinks as unknown,
      featured_blog_post_slugs: featuredPostSlugs
    };

    const { error: updateError } = await supabase
      .from("community_users")
      .update(payload as TablesUpdate<"community_users">)
      .eq("id", session.user.id);
    setIsSaving(false);

    if (updateError) {
      setError(updateError.message ?? "Unable to save profile changes.");
      return;
    }

    setSuccess("Profile updated.");
    router.refresh();
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
      <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="profile-name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-username" className="text-sm font-medium">
              Username
            </label>
            <input
              id="profile-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="profile-avatar-url" className="text-sm font-medium">
            Profile photo
          </label>
          <input
            id="profile-avatar-url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            placeholder="https://example.com/avatar.png"
          />
          <div className="space-y-1">
            <input
              id="profile-avatar-file"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setAvatarFile(file);
              }}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-secondary/80"
            />
            <p className="text-xs text-muted-foreground">
              You can paste a URL above or upload an image. Uploaded images are stored securely and used on your public profile.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="profile-bio" className="text-sm font-medium">
            Bio
          </label>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Tell people what you build and care about."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="profile-tech-stack" className="text-sm font-medium">
            Tech stack
          </label>
          <input
            id="profile-tech-stack"
            value={techStackInput}
            onChange={(event) => setTechStackInput(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            placeholder="React, TypeScript, Supabase"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="profile-featured-projects" className="text-sm font-medium">
            Featured projects
          </label>
          <textarea
            id="profile-featured-projects"
            value={featuredProjectsInput}
            onChange={(event) => setFeaturedProjectsInput(event.target.value)}
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder={"One per line:\nProject title | https://project-url.com | short description"}
          />
          <p className="text-xs text-muted-foreground">
            List up to three projects. Only the first three lines will be shown on your public profile.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="profile-links" className="text-sm font-medium">
            Links
          </label>
          <textarea
            id="profile-links"
            value={profileLinksInput}
            onChange={(event) => setProfileLinksInput(event.target.value)}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder={"One per line:\nLabel | https://your-link.com"}
          />
          <p className="text-xs text-muted-foreground">
            Add links to your website, GitHub, Twitter, or anywhere else you want people to find you.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Featured blog posts</p>
          <p className="text-xs text-muted-foreground">
            Choose posts to highlight in your dashboard profile card. Up to three will be shown.
          </p>
          {blogPosts.length > 0 ? (
            <div className="mt-2 space-y-2">
              {blogPosts.map((post) => {
                const isSelected = featuredPostSlugs.includes(post.slug);
                return (
                  <label
                    key={post.id}
                    className="flex cursor-pointer items-start gap-2 rounded-xl border border-border/70 bg-card/70 p-3"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        setFeaturedPostSlugs((previous) =>
                          previous.includes(post.slug)
                            ? previous.filter((slug) => slug !== post.slug)
                            : [...previous, post.slug]
                        )
                      }
                      className="mt-1 h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {post.status === "published" ? "Published" : "Draft"} · {post.views.toLocaleString()} views
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">You haven&apos;t created any blog posts yet.</p>
          )}
        </div>

        {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
        {success ? (
          <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">{success}</p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </section>
  );
}
