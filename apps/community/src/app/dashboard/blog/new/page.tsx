import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BlogPostEditorForm, type BlogPostEditorValues } from "@/components/pages/dashboard/blog/BlogPostEditorForm";
import { fetchDashboardProfile } from "@/lib/dashboard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "New Blog Post",
  description: "Create a new blog post from the community dashboard."
};

export const dynamic = "force-dynamic";

export default async function NewCommunityBlogPostPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/join");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/?next=/dashboard/blog/new");
  }

  const profile = await fetchDashboardProfile(supabase, user.id);
  if (!profile) {
    redirect("/join?redirect=/dashboard/blog/new");
  }

  const initialValues: BlogPostEditorValues = {
    title: "",
    slug: "",
    description: "",
    excerpt: "",
    authorName: profile.name,
    readTimeMinutes: "6",
    tagsInput: "",
    sectionHeading: "",
    sectionBody: "",
    isFeatured: false,
    status: "draft"
  };

  return (
    <main className="min-h-screen bg-background pt-10 sm:pt-14">
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Blog Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Create a new post</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Draft in community, publish to the public blog when you are ready.
          </p>
        </div>
        <BlogPostEditorForm mode="create" initialValues={initialValues} />
      </section>
    </main>
  );
}
