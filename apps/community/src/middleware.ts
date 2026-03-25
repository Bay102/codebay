import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Middleware should refresh/propagate auth cookies only.
  // Access control stays in server pages/routes (e.g. /dashboard page),
  // which is more reliable than Edge-level user checks in production.
  const { response } = await updateSession(request);
  return response;
}

export const config = {
  matcher: [
    /*
     * Refresh the Supabase session on navigations (not only /dashboard). A dashboard-only matcher
     * skips the SSR client refresh on other routes and can leave OAuth sessions inconsistent
     * before the first /dashboard hit. Exclude static assets and /auth/callback (PKCE exchange).
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
