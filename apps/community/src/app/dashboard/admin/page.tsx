import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { AdminLandingSection } from "../../../components/pages/admin/AdminLandingSection";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin controls for the CodingBay community landing page."
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/join");
  }

  try {
    await requireAdmin(supabase);
  } catch (error) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">CodingBay Community</p>
            <h1 className="text-lg font-semibold text-foreground sm:text-xl">Admin dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Control which posts and profiles are featured on the community landing page.
            </p>
          </div>
        </header>

        <AdminLandingSection />
      </section>
    </main>
  );
}

