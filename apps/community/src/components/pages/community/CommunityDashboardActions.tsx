"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { blogUrl } from "@/lib/site-urls";

export function CommunityDashboardActions() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const handleSignOut = async () => {
    if (!supabase) {
      router.push("/");
      return;
    }

    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setIsSigningOut(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Link
        href={blogUrl}
        className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
      >
        Open blog
      </Link>
      <button
        type="button"
        className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm text-foreground transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-70"
        onClick={() => void handleSignOut()}
        disabled={isSigningOut}
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
