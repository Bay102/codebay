import { SurfaceCard } from "@codebay/ui";
import { FeaturedPostsManager } from "@/components/pages/admin/FeaturedPostsManager";
import { FeaturedProfilesManager } from "@/components/pages/admin/FeaturedProfilesManager";

export function AdminLandingSection() {
  return (
    <div className="space-y-4">
      <SurfaceCard variant="card">
        <h2 className="text-sm font-semibold text-foreground">Community landing page</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure which content appears on the public community landing page. Admin selections are used first,
          with engagement-based ranking as a fallback.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2">
        <FeaturedPostsManager />
        <FeaturedProfilesManager />
      </div>
    </div>
  );
}

