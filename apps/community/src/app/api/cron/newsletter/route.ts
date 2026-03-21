import { NextResponse } from "next/server";
import { runNewsletterDigestJob } from "@/lib/newsletter/digest-job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getRequestSecret(request: Request): string {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }
  return request.headers.get("x-cron-secret")?.trim() ?? "";
}

function getBaseUrl(request: Request): string {
  const envBaseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envBaseUrl) return envBaseUrl;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

async function handleCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET ?? process.env.VERCEL_CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "Cron secret is not configured." }, { status: 500 });
  }

  const requestSecret = getRequestSecret(request);
  if (!requestSecret || requestSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? "");
  const userLimit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : undefined;

  try {
    const summary = await runNewsletterDigestJob({
      baseUrl: getBaseUrl(request),
      userLimit
    });
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process newsletter digest job.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
