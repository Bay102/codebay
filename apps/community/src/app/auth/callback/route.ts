import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database";
import { hasSupabaseConfig, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import { blogUrl, mainUrl, siteUrl } from "@/lib/site-urls";

const fallbackRedirectPath = "/dashboard";

const allowedRedirectOrigins = new Set(
  [siteUrl, blogUrl, mainUrl].map((url) => {
    try {
      return new URL(url).origin;
    } catch {
      return "";
    }
  })
);

function resolveRedirectDestination(rawRedirect: string | null): string {
  if (!rawRedirect) {
    return fallbackRedirectPath;
  }

  if (rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")) {
    return rawRedirect;
  }

  try {
    const parsed = new URL(rawRedirect);
    if (allowedRedirectOrigins.has(parsed.origin)) {
      return parsed.toString();
    }
  } catch {
    return fallbackRedirectPath;
  }

  return fallbackRedirectPath;
}

function buildRedirectUrl(destination: string, baseUrl: string): string {
  if (destination.startsWith("http")) {
    return destination;
  }
  return new URL(destination, baseUrl).toString();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? searchParams.get("redirect");

  const redirectDestination = resolveRedirectDestination(nextParam);
  const redirectUrl = buildRedirectUrl(redirectDestination, request.url);

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  if (!hasSupabaseConfig) {
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
