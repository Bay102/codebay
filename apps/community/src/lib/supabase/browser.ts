import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database";
import { hasSupabaseConfig, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createBrowserSupabaseClient() {
  if (!hasSupabaseConfig) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  return browserClient;
}
