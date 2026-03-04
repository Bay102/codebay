"use client";

import { useState } from "react";
import { TopicPillsPicker } from "@codebay/ui";
import { setPreferredTagsAction } from "@/app/actions";
import type { TagOption } from "@/lib/tags";

type PreferredTopicsSectionProps = {
  allowedTags: TagOption[];
  initialPreferredTagIds: string[];
};

export function PreferredTopicsSection({ allowedTags, initialPreferredTagIds }: PreferredTopicsSectionProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialPreferredTagIds));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = async (nextIds: string[]) => {
    setSelectedIds(new Set(nextIds));
    setMessage(null);
    setIsSaving(true);
    const result = await setPreferredTagsAction(nextIds);
    setIsSaving(false);
    if (result.success) {
      setMessage({ type: "success", text: "Preferences saved." });
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to save." });
    }
  };

  if (allowedTags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Topics to follow</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose topics you care about. We use these to show relevant blog posts and discussions on your home feed.
        </p>
      </div>
      <TopicPillsPicker
        options={allowedTags.map((tag) => ({ key: tag.id, label: tag.name }))}
        selectedKeys={[...selectedIds]}
        onChange={(next) => void handleChange(next)}
        ariaLabel="Preferred topics"
        disabled={isSaving}
      />
      {message ? (
        <p
          className={`text-xs ${message.type === "success" ? "text-emerald-600" : "text-destructive"}`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
