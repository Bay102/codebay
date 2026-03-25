import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function applyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie.name, cookie.value);
  }
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return response;
  }

  if (user) {
    return response;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/";
  redirectUrl.searchParams.set("next", "/dashboard");

  const redirectResponse = NextResponse.redirect(redirectUrl);
  applyCookies(response, redirectResponse);

  return redirectResponse;
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
