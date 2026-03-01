import type { Metadata } from "next";
import { Suspense } from "react";
import { SurfaceCard } from "@codebay/ui";
import { BlogSignInCard } from "@/components/pages/blog/BlogSignInCard";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your CodingBay account to react and comment on blog posts."
};

export default function BlogSignInPage() {
  return (
    <main className="min-h-screen bg-background pb-20 pt-10 sm:pt-14">
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
        <SurfaceCard as="div" variant="hero">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">CodingBay Access</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Sign in to continue
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
            Use your existing community account to participate in post engagement on the blog.
          </p>
        </SurfaceCard>

        <section className="mt-10">
          <Suspense
            fallback={
              <SurfaceCard variant="panel">
                <p className="text-sm text-muted-foreground">Loading sign-in...</p>
              </SurfaceCard>
            }
          >
            <BlogSignInCard />
          </Suspense>
        </section>
      </section>
    </main>
  );
}
