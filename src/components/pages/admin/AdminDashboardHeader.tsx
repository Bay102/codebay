import { Loader2, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AdminDashboardStats = {
  total: number;
  newLeads: number;
  read: number;
};

type AdminDashboardHeaderProps = {
  userEmail: string | null | undefined;
  stats: AdminDashboardStats;
  isLoading: boolean;
  isSigningOut: boolean;
  onRefresh: () => void;
  onSignOut: () => void;
};

export const AdminDashboardHeader = ({
  userEmail,
  stats,
  isLoading,
  isSigningOut,
  onRefresh,
  onSignOut,
}: AdminDashboardHeaderProps) => (
  <section className="glass-nav rounded-2xl border border-border/60 p-5 sm:p-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <p className="text-primary/80 text-xs font-semibold tracking-[0.16em] uppercase">
          Admin Dashboard
        </p>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Chat Handoffs
        </h1>
        <p className="text-sm text-muted-foreground">Live view of the `chat_handoffs` table.</p>
      </div>

      <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
        <p className="text-xs text-muted-foreground">
          Signed in as {userEmail ?? "authenticated user"}
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button onClick={onRefresh} variant="outline" className="w-full md:w-auto" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Button
            onClick={onSignOut}
            variant="secondary"
            className="w-full md:w-auto"
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              "Sign out"
            )}
          </Button>
        </div>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-border/60 bg-card/70 p-4">
        <p className="text-xs text-muted-foreground">Total Leads</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{stats.total}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card/70 p-4">
        <p className="text-xs text-muted-foreground">New Leads</p>
        <p className="mt-1 text-2xl font-semibold text-primary">{stats.newLeads}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card/70 p-4">
        <p className="text-xs text-muted-foreground">Read</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{stats.read}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card/70 p-4">
        <p className="text-xs text-muted-foreground">Source</p>
        <p className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
          <Users className="h-4 w-4 text-primary" />
          chat_handoffs
        </p>
      </div>
    </div>
  </section>
);
