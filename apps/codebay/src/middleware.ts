import { NextResponse, type NextRequest } from "next/server";

const PAUSED_PATH = "/paused";

function shouldBypassPause(pathname: string): boolean {
  if (pathname === PAUSED_PATH || pathname.startsWith(`${PAUSED_PATH}/`)) {
    return true;
  }

  if (pathname.startsWith("/admin")) {
    return true;
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return true;
  }

  if (/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  if (process.env.SITE_PAUSED !== "true") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (shouldBypassPause(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = PAUSED_PATH;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
