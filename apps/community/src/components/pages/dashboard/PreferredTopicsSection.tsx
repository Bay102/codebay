"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TopicPillsPicker } from "@codebay/ui";
import { setPreferredTagsAction } from "@/lib/actions";
import type { TagOption } from "@/lib/tags";

type PreferredTopicsSectionProps = {
  allowedTags: TagOption[];
  initialPreferredTagIds: string[];
  defaultOpen?: boolean;
};

export function PreferredTopicsSection({ allowedTags, initialPreferredTagIds, defaultOpen = false }: PreferredTopicsSectionProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialPreferredTagIds));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isOpen, setIsOpen] = useState(defaultOpen);

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
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="preferred-topics-content"
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground">Topics you follow</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Used to show relevant discussions, blog posts and profiles
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div id="preferred-topics-content" className="space-y-2">
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
      ) : null}
    </div>
  );
}
