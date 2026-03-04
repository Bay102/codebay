import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BlogPostEditorForm, type BlogPostEditorValues } from "@/components/pages/dashboard/blog/BlogPostEditorForm";
import type { Json } from "@/lib/database";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Blog Post",
  description: "Edit blog drafts and published posts from your community dashboard."
};

export const dynamic = "force-dynamic";

function parseSectionBody(rawSections: Json): { heading: string; body: string } {
  if (!Array.isArray(rawSections) || rawSections.length === 0) {
    return { heading: "", body: "" };
  }

  const firstSection = rawSections[0];
  if (!firstSection || typeof firstSection !== "object" || Array.isArray(firstSection)) {
    return { heading: "", body: "" };
  }

  const section = firstSection as Record<string, unknown>;
  const heading = typeof section.heading === "string" ? section.heading : "";
  const paragraphs = Array.isArray(section.paragraphs)
    ? section.paragraphs.filter((paragraph): paragraph is string => typeof paragraph === "string")
    : [];

  return {
    heading,
    body: paragraphs.join("\n\n")
  };
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

  const parsedSection = parseSectionBody(post.sections);
  const initialValues: BlogPostEditorValues = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description ?? "",
    excerpt: post.excerpt ?? "",
    authorName: post.author_name ?? "CodeBay Team",
    readTimeMinutes: String(post.read_time_minutes ?? 6),
    tagsInput: (post.tags ?? []).join(", "),
    sectionHeading: parsedSection.heading,
    sectionBody: parsedSection.body,
    isFeatured: post.is_featured ?? false,
    status: post.status === "published" ? "published" : "draft"
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Blog Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Edit post</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update your post metadata, content, and publish state.
          </p>
        </div>
        <BlogPostEditorForm mode="edit" initialValues={initialValues} />
      </section>
    </main>
  );
}
