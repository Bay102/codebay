import { Loader2 } from "lucide-react";

export const AdminSessionLoading = () => (
  <div className="min-h-[100dvh] bg-background px-4 py-8 sm:px-6 md:px-8 lg:px-12">
    <div className="mx-auto flex w-full max-w-md items-center justify-center rounded-2xl border border-border/60 bg-card/70 p-8">
      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking admin session...
      </div>
    </div>
  </div>
);
