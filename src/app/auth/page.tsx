import type { Metadata } from "next";
import { CommunityAuthCard } from "@/components/pages/community/CommunityAuthCard";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in or create your CodeBay account to access the community, dashboard, and personalized features."
};

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-background pt-20">
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="mx-auto max-w-md">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Account</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Sign in or sign up
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Access your CodeBay account to join the community, manage your dashboard, and collaborate with other
            builders.
          </p>
        </div>

        <section id="auth" className="mx-auto mt-10 max-w-md">
          <CommunityAuthCard />
        </section>
      </section>
    </main>
  );
}
