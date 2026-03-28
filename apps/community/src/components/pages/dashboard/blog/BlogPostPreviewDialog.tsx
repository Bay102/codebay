"use client";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  parseBlogSectionBlock,
  Tag
} from "@codebay/ui";

export type BlogPostPreviewSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogPostPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  excerpt: string;
  authorName: string;
  readTimeMinutes: number;
  tags: string[];
  sections: BlogPostPreviewSection[];
};

export function BlogPostPreviewDialog({
  open,
  onOpenChange,
  title,
  excerpt,
  authorName,
  readTimeMinutes,
  tags,
  sections
}: BlogPostPreviewDialogProps) {
  const displayTitle = title.trim() || "Untitled post";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,900px)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-border/70 px-6 py-4 text-left sm:px-8">
          <DialogTitle className="text-base font-semibold">Post preview</DialogTitle>
          <p className="text-xs text-muted-foreground">
            This is how your post will look when published. Engagement and share actions are not shown here.
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="border border-border/60 bg-card/40 px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium uppercase tracking-wide text-primary">CodeBay Insights</p>
              <span className="rounded-full border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                Preview
              </span>
            </div>
            <h2 className="font-hero mt-3 max-w-4xl text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl">
              {displayTitle}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{readTimeMinutes} min read</span>
              <span aria-hidden="true">-</span>
              <span>{authorName}</span>
            </div>
            {excerpt.trim() ? (
              <p className="font-hero mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{excerpt}</p>
            ) : null}
            {tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Tag key={tag} variant="tech" size="md">
                    {tag}
                  </Tag>
                ))}
              </div>
            ) : null}
          </div>

          <article className="mt-4 border border-border/70 bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-10 md:px-10">
            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No section content yet. Add body content in the editor to see it here—empty sections are omitted when you
                save, same as on the live post.
              </p>
            ) : (
              <div className="space-y-10">
                {sections.map((section, sectionIndex) => (
                  <section key={`${section.heading}-${sectionIndex}`}>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">{section.heading}</h3>
                    <div className="mt-4 space-y-4">
                      {section.paragraphs.map((paragraph, paragraphIndex) => {
                        const block = parseBlogSectionBlock(paragraph);

                        if (block.type === "unordered-list") {
                          return (
                            <ul
                              key={`${section.heading}-${paragraphIndex}`}
                              className="list-disc space-y-2 pl-6 text-base leading-8 text-muted-foreground sm:text-lg"
                            >
                              {block.items.map((item, itemIndex) => (
                                <li key={`${section.heading}-${paragraphIndex}-${itemIndex}`}>{item}</li>
                              ))}
                            </ul>
                          );
                        }

                        if (block.type === "ordered-list") {
                          return (
                            <ol
                              key={`${section.heading}-${paragraphIndex}`}
                              className="list-decimal space-y-2 pl-6 text-base leading-8 text-muted-foreground sm:text-lg"
                            >
                              {block.items.map((item, itemIndex) => (
                                <li key={`${section.heading}-${paragraphIndex}-${itemIndex}`}>{item}</li>
                              ))}
                            </ol>
                          );
                        }

                        if (block.type === "paragraph") {
                          return (
                            <p
                              key={`${section.heading}-${paragraphIndex}`}
                              className="whitespace-pre-line text-base leading-8 text-muted-foreground sm:text-lg"
                            >
                              {block.content}
                            </p>
                          );
                        }

                        return null;
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </article>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/70 px-6 py-3 sm:px-8">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
