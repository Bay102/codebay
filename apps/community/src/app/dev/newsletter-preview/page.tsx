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
    authorAvatarUrl: "https://picsum.photos/seed/alexrivera/80/80",
    publishedAt: "2025-03-18T14:30:00.000Z",
    viewCount: 1284,
    reactionCount: 42,
    commentCount: 17
  },
  {
    title: "RLS patterns that survived our first 10k daily active users",
    url: `${MOCK_ORIGIN}/blog/samlane/rls-patterns-10k-dau`,
    authorName: "Sam Lane",
    authorAvatarUrl: null,
    publishedAt: "2025-03-16T09:15:00.000Z",
    viewCount: 892,
    reactionCount: 31,
    commentCount: 9
  },
  {
    title: "A practical checklist before you add cron to Vercel",
    url: `${MOCK_ORIGIN}/blog/jordankim/vercel-cron-checklist`,
    authorName: "Jordan Kim",
    authorAvatarUrl: "https://picsum.photos/seed/jordankim/80/80",
    publishedAt: "2025-03-12T18:00:00.000Z",
    viewCount: 2103,
    reactionCount: 56,
    commentCount: 24
  }
];

const MOCK_DISCUSSION_ITEMS: DigestDiscussionItem[] = [
  {
    title: "How are you handling optimistic updates with Supabase Realtime?",
    url: `${MOCK_ORIGIN}/discussions/optimistic-updates-supabase-realtime`,
    authorName: "Morgan Patel",
    authorAvatarUrl: "https://picsum.photos/seed/morganpatel/80/80",
    createdAt: "2025-03-19T11:22:00.000Z",
    commentCount: 34,
    reactionCount: 18
  },
  {
    title: "Best practices for email digests without annoying power users",
    url: `${MOCK_ORIGIN}/discussions/email-digest-best-practices`,
    authorName: "Casey Nguyen",
    authorAvatarUrl: null,
    createdAt: "2025-03-17T08:45:00.000Z",
    commentCount: 12,
    reactionCount: 7
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
      managePreferencesUrl: `${MOCK_ORIGIN}/settings`,
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
