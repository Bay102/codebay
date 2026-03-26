import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BlogPostEditorForm, type BlogPostEditorValues } from "@/components/pages/dashboard/blog/BlogPostEditorForm";
import { FocusButton } from "@/components/shared/buttons/FocusButton";
import { fetchDashboardProfile } from "@/lib/dashboard";
import { fetchAllTags } from "@/lib/tags";
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

  const allowedTags = await fetchAllTags(supabase);

  const initialValues: BlogPostEditorValues = {
    title: "",
    slug: "",
    description: "",
    excerpt: "",
    authorName: profile.name,
    readTimeMinutes: "6",
    tagsInput: "",
    sections: [
      {
        id: "section-1",
        heading: "",
        content: ""
      }
    ],
    isFeatured: false,
    status: "draft"
  };

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 py-5 sm:px-6 lg:px-8">

        <div className="mb-6">

          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Blog Dashboard</p>

          <div className="mt-2 flex gap-3 items-center justify-between sm:gap-4">

            <h1 className="mt-2 text-2xl font-semibold text-foreground">Create a new post</h1>

            <FocusButton
              href="/dashboard/blog"
              radiusVariant="square"
              colorVariant="plain"
              borderVariant="borderless"
              sizeVariant="sm"
            >
              Back
            </FocusButton>

          </div>

        </div>

        <BlogPostEditorForm mode="create" initialValues={initialValues} allowedTags={allowedTags} />
      </section>
    </main>
  );
}
