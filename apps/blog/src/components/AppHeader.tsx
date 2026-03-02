"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppHeader as SharedAppHeader, CodeBayLogo } from "@codebay/ui";
import type { AppHeaderMenuItem } from "@codebay/ui";
import { communityUrl } from "@/lib/site-urls";
import { getBlogSupabaseClient } from "@/lib/supabase";

export function BlogAppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => getBlogSupabaseClient(), []);
  const [hasSession, setHasSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsCheckingSession(false);
      return;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setHasSession(!!data.session);
      setIsCheckingSession(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setHasSession(!!session);
      setIsCheckingSession(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const menuItems = useMemo<AppHeaderMenuItem[]>(() => {
    const items: AppHeaderMenuItem[] = [
      { type: "link", href: communityUrl, label: "Community" },
      { type: "link", href: `${communityUrl}/dashboard`, label: "Dashboard" }
    ];

    if (!supabase || isCheckingSession) {
      return items;
    }

    if (hasSession) {
      items.push({
        type: "button",
        label: "Sign out",
        onSelect: () => {
          void (async () => {
            await supabase.auth.signOut();
            router.refresh();
          })();
        }
      });
    } else {
      items.push({
        type: "button",
        label: "Sign in",
        onSelect: () => {
          const redirectPath = pathname && pathname !== "/sign-in" ? pathname : "/";
          const query = redirectPath !== "/" ? `?redirect=${encodeURIComponent(redirectPath)}` : "";
          router.push(`/sign-in${query}`);
        }
      });
    }

    return items;
  }, [hasSession, isCheckingSession, pathname, router, supabase]);

  return (
    <SharedAppHeader
      homeHref="/"
      logo={<CodeBayLogo className="h-6 w-auto md:h-8" />}
      menuItems={menuItems}
    />
  );
}
