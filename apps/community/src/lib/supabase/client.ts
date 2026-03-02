import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let communityClient: ReturnType<typeof createClient<Database>> | null = null;
let blogClient: ReturnType<typeof createClient<Database>> | null = null;

export function getCommunitySupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!communityClient) {
    communityClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  return communityClient;
}

export function getBlogSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!blogClient) {
    blogClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  return blogClient;
}

