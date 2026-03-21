import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  BlogPostEditorForm,
  type BlogPostEditorValues,
  type BlogPostSectionDraft
} from "@/components/pages/dashboard/blog/BlogPostEditorForm";
import type { Json } from "@/lib/database";
import { fetchAllTags } from "@/lib/tags";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FocusButton } from "@/components/shared/buttons/FocusButton";

export const metadata: Metadata = {
  title: "Edit Blog Post",
  description: "Edit blog drafts and published posts from your community dashboard."
};

export const dynamic = "force-dynamic";

function parseSections(rawSections: Json): BlogPostSectionDraft[] {
  if (!Array.isArray(rawSections) || rawSections.length === 0) {
    return [
      {
        id: "section-1",
        heading: "",
        content: ""
      }
    ];
  }

  return rawSections
    .map((section, index): BlogPostSectionDraft | null => {
      if (!section || typeof section !== "object" || Array.isArray(section)) {
        return null;
      }

      const typedSection = section as Record<string, unknown>;
      const heading = typeof typedSection.heading === "string" ? typedSection.heading : "";
      const paragraphs = Array.isArray(typedSection.paragraphs)
        ? typedSection.paragraphs.filter(
          (paragraph): paragraph is string => typeof paragraph === "string"
        )
        : [];

      return {
        id: `section-${index + 1}`,
        heading,
        content: paragraphs.join("\n\n")
      };
    })
    .filter((section): section is BlogPostSectionDraft => section !== null);
}

type EditBlogPostPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function EditCommunityBlogPostPage({ params }: EditBlogPostPageProps) {
  const { postId } = await params;
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/join");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/dashboard/blog/new?next=/dashboard/blog/edit/${postId}`);
  }

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("id,slug,title,description,excerpt,author_name,read_time_minutes,tags,sections,is_featured,status")
    .eq("id", postId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (error) {
    notFound();
  }

  if (!post) {
    notFound();
  }

  const parsedSections = parseSections(post.sections);
  const allowedTags = await fetchAllTags(supabase);

  const initialValues: BlogPostEditorValues = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description ?? "",
    excerpt: post.excerpt ?? "",
    authorName: post.author_name ?? "CodeBay Team",
    readTimeMinutes: String(post.read_time_minutes ?? 6),
    tagsInput: (post.tags ?? []).join(", "),
    sections: parsedSections,
    isFeatured: post.is_featured ?? false,
    status: post.status === "published" ? "published" : "draft"
  };

  return (
    <main className="bg-background pb-5 px-2">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Blog Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Edit post</h1>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <p className="min-w-0 flex-1 text-sm text-muted-foreground">
              Update your post metadata, content, and publish state.
            </p>
            <FocusButton
              href="/dashboard/blog"
              radiusVariant="small"
              colorVariant="plain"
              borderVariant="bordered"
              sizeVariant="sm"
              className="shrink-0 self-start"
            >
              Back
            </FocusButton>
          </div>
        </div>
        <BlogPostEditorForm mode="edit" initialValues={initialValues} allowedTags={allowedTags} />
      </section>
    </main>
  );
}
