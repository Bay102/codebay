import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database";
import { hasSupabaseConfig, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export async function updateSession(request: NextRequest) {
  // Preserve the incoming request headers; mutating only cookies on `request` avoids Edge quirks
  // where omitting headers breaks Supabase cookie refresh (see @supabase/ssr Next.js guidance).
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  if (!hasSupabaseConfig) {
    return { response, user: null };
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });

        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { response, user };
}
