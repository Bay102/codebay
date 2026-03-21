import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database";
import { verifyUnsubscribeToken } from "@/lib/newsletter/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function htmlResponse(title: string, body: string, status = 200): NextResponse {
  return new NextResponse(
    `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; background: #0b1020; color: #e5e7eb; margin: 0; padding: 32px;">
    <main style="max-width: 560px; margin: 0 auto; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; background: #111827;">
      <h1 style="margin-top: 0; font-size: 24px; line-height: 32px;">${title}</h1>
      <p style="font-size: 14px; line-height: 22px; color: #d1d5db;">${body}</p>
      <p style="font-size: 14px; line-height: 22px; color: #d1d5db;">
        You can manage all newsletter settings from your CodeBay settings page (/settings).
      </p>
    </main>
  </body>
</html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    }
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  if (!token) {
    return htmlResponse("Invalid unsubscribe link", "The unsubscribe link is missing a token.", 400);
  }

  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET ?? process.env.CRON_SECRET;
  if (!secret) {
    return htmlResponse("Configuration error", "Newsletter unsubscribe is not configured yet.", 500);
  }

  const payload = verifyUnsubscribeToken(token, secret);
  if (!payload) {
    return htmlResponse("Invalid unsubscribe link", "This unsubscribe link is invalid or has expired.", 400);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return htmlResponse("Configuration error", "Supabase service credentials are missing.", 500);
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { error } = await supabase.from("newsletter_settings").upsert(
    {
      user_id: payload.userId,
      frequency: "none"
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return htmlResponse("Unable to unsubscribe", "We could not process your request right now. Please try again.", 500);
  }

  return htmlResponse("You are unsubscribed", "Digest emails have been disabled for your account.");
}
