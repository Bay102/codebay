"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TablesUpdate } from "@/lib/database";
import type { DashboardProfile, FeaturedProject } from "@/lib/dashboard";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type ProfileSettingsFormProps = {
  profile: DashboardProfile;
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

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [techStackInput, setTechStackInput] = useState(profile.techStack.join(", "));
  const [featuredProjectsInput, setFeaturedProjectsInput] = useState(featuredProjectsToInput(profile.featuredProjects));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError("Supabase is unavailable in this environment.");
      return;
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    const techStack = techStackInput
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    const featuredProjects = parseFeaturedProjects(featuredProjectsInput);

    setIsSaving(true);
    const payload: TablesUpdate<"community_users"> = {
      name: name.trim() || profile.name,
      username: username.trim().toLowerCase() || profile.username,
      bio: bio.trim() || null,
      avatar_url: avatarUrl.trim() || null,
      tech_stack: techStack,
      featured_projects: featuredProjects as unknown as TablesUpdate<"community_users">["featured_projects"]
    };

    const { error: updateError } = await supabase.from("community_users").update(payload).eq("id", session.user.id);
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
          <label htmlFor="profile-avatar" className="text-sm font-medium">
            Profile photo URL
          </label>
          <input
            id="profile-avatar"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            placeholder="https://example.com/avatar.png"
          />
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
