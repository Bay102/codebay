"use client";

import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@codebay/ui";
import type { TagOption } from "@/lib/tags";
import { PreferredTopicsSection } from "@/components/pages/dashboard/PreferredTopicsSection";

type PreferredTopicsDialogProps = {
  allowedTags: TagOption[];
  initialPreferredTagIds: string[];
};

export function PreferredTopicsDialog({ allowedTags, initialPreferredTagIds }: PreferredTopicsDialogProps) {
  if (allowedTags.length === 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Edit followed topics"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-primary"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="sr-only">Edit followed topics</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit preferred topics</DialogTitle>
        </DialogHeader>
        <PreferredTopicsSection allowedTags={allowedTags} initialPreferredTagIds={initialPreferredTagIds} defaultOpen={true} />
      </DialogContent>
    </Dialog>
  );
}

