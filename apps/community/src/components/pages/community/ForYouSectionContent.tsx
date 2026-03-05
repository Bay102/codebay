"use client";

import { useMemo, useState } from "react";
import { AnimatedCardSection, BlogPostCard, DiscussionCard } from "@codebay/ui";
import type { LandingFeaturedPost, ForYouDiscussion } from "@/lib/landing";
import { buildPostUrl } from "@/lib/blog-urls";
import { mapForYouDiscussionToDiscussionCardData, mapLandingFeaturedPostToBlogPostCardData } from "@/lib/ui-mappers";

type ForYouSectionContentProps = {
  discussions: ForYouDiscussion[];
  posts: LandingFeaturedPost[];
};

type PaginationControlProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  "aria-label"?: string;
};

const DISCUSSIONS_PER_PAGE = 4;
const MAX_DISCUSSION_PAGES = 3;
const POSTS_PER_PAGE = 2;
const MAX_POST_PAGES = 3;

function PaginationControl({ currentPage, totalPages, onPageChange, "aria-label": ariaLabel }: PaginationControlProps) {
  if (totalPages <= 1) return null;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-1.5 py-1 text-[11px]"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/70 disabled:cursor-default disabled:opacity-40"
        aria-label="Previous page"
      >
        ←
      </button>
      <div className="inline-flex items-center gap-0.5">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-full border px-2 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors ${
                isActive
                  ? "border-primary/80 bg-primary/90 text-primary-foreground shadow-sm"
                  : "border-border/60 bg-background/90 text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/70 disabled:cursor-default disabled:opacity-40"
        aria-label="Next page"
      >
        →
      </button>
    </div>
  );
}

export function ForYouSectionContent({ discussions, posts }: ForYouSectionContentProps) {
  const [discussionPage, setDiscussionPage] = useState(1);
  const [postPage, setPostPage] = useState(1);

  const { visibleDiscussions, discussionTotalPages, safeDiscussionPage } = useMemo(() => {
    const totalPages = Math.min(
      MAX_DISCUSSION_PAGES,
      Math.max(1, Math.ceil(discussions.length / DISCUSSIONS_PER_PAGE))
    );
    const clampedPage = Math.min(discussionPage, totalPages);
    const start = (clampedPage - 1) * DISCUSSIONS_PER_PAGE;
    const slice = discussions.slice(start, start + DISCUSSIONS_PER_PAGE);
    return {
      visibleDiscussions: slice,
      discussionTotalPages: totalPages,
      safeDiscussionPage: clampedPage
    };
  }, [discussions, discussionPage]);

  const { visiblePosts, postTotalPages, safePostPage } = useMemo(() => {
    const totalPages = Math.min(MAX_POST_PAGES, Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE)));
    const clampedPage = Math.min(postPage, totalPages);
    const start = (clampedPage - 1) * POSTS_PER_PAGE;
    const slice = posts.slice(start, start + POSTS_PER_PAGE);
    return {
      visiblePosts: slice,
      postTotalPages: totalPages,
      safePostPage: clampedPage
    };
  }, [posts, postPage]);

  const hasDiscussions = discussions.length > 0;
  const hasPosts = posts.length > 0;

  return (
    <>
      {hasDiscussions ? (
        <section className="mt-4" aria-label="Tailored discussions">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">Discussions</p>
            <PaginationControl
              currentPage={safeDiscussionPage}
              totalPages={discussionTotalPages}
              onPageChange={setDiscussionPage}
              aria-label="Discussions pages"
            />
          </div>
          <div className="mt-1">
            <AnimatedCardSection as="div" columns={{ base: 1, sm: 2 }}>
              {visibleDiscussions.map((item) => {
                const discussion = mapForYouDiscussionToDiscussionCardData(item);
                return (
                  <DiscussionCard
                    key={discussion.id}
                    discussion={discussion}
                    href={`/discussions/${discussion.slug}`}
                    showAuthor
                    showDate
                    showEngagement
                    showTags
                  />
                );
              })}
            </AnimatedCardSection>
          </div>
        </section>
      ) : null}

      {hasPosts ? (
        <section className="mt-5" aria-label="Tailored blog posts">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">Blog posts</p>
            <PaginationControl
              currentPage={safePostPage}
              totalPages={postTotalPages}
              onPageChange={setPostPage}
              aria-label="Blog posts pages"
            />
          </div>
          <AnimatedCardSection as="div" columns={{ base: 1, md: 2 }} className="mt-1.5">
            {visiblePosts.map((post) => {
              const cardData = mapLandingFeaturedPostToBlogPostCardData(post);
              return (
                <BlogPostCard
                  key={cardData.id}
                  post={cardData}
                  href={buildPostUrl(post.authorName, post.slug)}
                  showAuthor
                  showDate
                  showEngagement
                  showTags
                />
              );
            })}
          </AnimatedCardSection>
        </section>
      ) : null}
    </>
  );
}

