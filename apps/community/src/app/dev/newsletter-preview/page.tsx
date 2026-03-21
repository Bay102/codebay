import { render } from "@react-email/render";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  FollowedCreatorsDigestEmail,
  type DigestBlogItem,
  type DigestDiscussionItem
} from "@/components/emails/FollowedCreatorsDigestEmail";

export const metadata: Metadata = {
  title: "Newsletter email preview (dev)",
  robots: { index: false, follow: false }
};

/** Local origin for mock links; adjust if your dev server uses another port. */
const MOCK_ORIGIN = "http://localhost:3002";

const MOCK_BLOG_ITEMS: DigestBlogItem[] = [
  {
    title: "Shipping incremental TypeScript adoption in a brownfield Next.js app",
    url: `${MOCK_ORIGIN}/blog/alexrivera/shipping-incremental-typescript`,
    authorName: "Alex Rivera",
    publishedAt: "2025-03-18T14:30:00.000Z"
  },
  {
    title: "RLS patterns that survived our first 10k daily active users",
    url: `${MOCK_ORIGIN}/blog/samlane/rls-patterns-10k-dau`,
    authorName: "Sam Lane",
    publishedAt: "2025-03-16T09:15:00.000Z"
  },
  {
    title: "A practical checklist before you add cron to Vercel",
    url: `${MOCK_ORIGIN}/blog/jordankim/vercel-cron-checklist`,
    authorName: "Jordan Kim",
    publishedAt: "2025-03-12T18:00:00.000Z"
  }
];

const MOCK_DISCUSSION_ITEMS: DigestDiscussionItem[] = [
  {
    title: "How are you handling optimistic updates with Supabase Realtime?",
    url: `${MOCK_ORIGIN}/discussions/optimistic-updates-supabase-realtime`,
    authorName: "Morgan Patel",
    createdAt: "2025-03-19T11:22:00.000Z"
  },
  {
    title: "Best practices for email digests without annoying power users",
    url: `${MOCK_ORIGIN}/discussions/email-digest-best-practices`,
    authorName: "Casey Nguyen",
    createdAt: "2025-03-17T08:45:00.000Z"
  }
];

export default async function NewsletterEmailPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const html = await render(
    FollowedCreatorsDigestEmail({
      recipientName: "Jamie",
      frequencyLabel: "weekly",
      blogItems: MOCK_BLOG_ITEMS,
      discussionItems: MOCK_DISCUSSION_ITEMS,
      siteUrl: MOCK_ORIGIN,
      managePreferencesUrl: `${MOCK_ORIGIN}/dashboard/profile`,
      unsubscribeUrl: `${MOCK_ORIGIN}/newsletter/unsubscribe?token=dev-preview-token`
    })
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <div className="border-b border-border/80 bg-amber-950/30 px-4 py-2 text-center text-xs text-amber-200/95">
        Dev-only preview — <code className="rounded bg-black/30 px-1 py-0.5">/dev/newsletter-preview</code> is not available in production builds.
      </div>
      <iframe
        title="Followed creators digest email preview"
        srcDoc={html}
        className="min-h-[800px] w-full flex-1 border-0 bg-muted/20"
      />
    </div>
  );
}
