import { NextResponse } from "next/server";
import { fetchDashboardActivity } from "@/lib/dashboard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ hasUnread: false, count: 0 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ hasUnread: false, count: 0 }, { status: 401 });
  }

  const activity = await fetchDashboardActivity(supabase, {
    userId: user.id,
    userEmail: user.email ?? undefined,
    limit: 1
  });

  return NextResponse.json({
    hasUnread: activity.length > 0,
    count: activity.length > 0 ? 1 : 0
  });
}
