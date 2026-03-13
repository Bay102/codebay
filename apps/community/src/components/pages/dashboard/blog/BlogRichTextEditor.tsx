"use client";

import { useEffect, useMemo, useState } from "react";
import { SurfaceCard } from "@codebay/ui";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Minus, Trash2, ChevronUp, ChevronDown, PlusCircle, Wand2 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import type { BlogPostSectionDraft } from "./BlogPostEditorForm";

type AiActionId = "fix-grammar" | "improve-clarity" | "shorten" | "expand";

type BlogRichTextEditorProps = {
  sections: BlogPostSectionDraft[];
  onChange: (nextSections: BlogPostSectionDraft[]) => void;
  disabled?: boolean;
};

type SectionEditorProps = {
  section: BlogPostSectionDraft;
  index: number;
  totalSections: number;
  onChange: (next: BlogPostSectionDraft) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onAiEdit: (action: AiActionId) => Promise<void>;
  disabled?: boolean;
};

function plainTextToHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "<p></p>";
  }

  if (trimmed.includes("<") && trimmed.includes(">")) {
    return value;
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function htmlToPlainText(value: string): string {
  if (!value.trim()) {
    return "";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(value, "text/html");
  return (doc.body.textContent ?? "").trim();
}

function SectionEditor({
  section,
  index,
  totalSections,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAiEdit,
  disabled
}: SectionEditorProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);

  const editor = useEditor(
    {
      extensions: [StarterKit, Underline],
      content: plainTextToHtml(section.content),
      editable: !disabled,
      editorProps: {
        attributes: {
          class:
            "min-h-[260px] px-5 py-2 text-[15px] leading-7 text-foreground outline-none [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:my-1 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_strong]:font-semibold [&_em]:italic [&_u]:underline"
        }
      },
      onUpdate: ({ editor: nextEditor }) => {
        onChange({
          ...section,
          content: nextEditor.getHTML()
        });
      }
    },
    [section.id]
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent = plainTextToHtml(section.content);
    const currentContent = editor.getHTML();

    if (currentContent !== nextContent) {
      editor.commands.setContent(nextContent, false);
    }
  }, [editor, section.content]);

  const aiActions: { id: AiActionId; label: string }[] = useMemo(
    () => [
      { id: "fix-grammar", label: "Fix grammar" },
      { id: "improve-clarity", label: "Improve clarity" },
      { id: "shorten", label: "More concise" },
      { id: "expand", label: "Expand" }
    ],
    []
  );

  const runAiAction = async (actionId: AiActionId) => {
    if (!editor) return;
    const text = editor.getText();
    if (!text.trim()) return;

    setIsAiLoading(true);
    try {
      await onAiEdit(actionId);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!editor) {
    return null;
  }

  const applyFormatting = (command: "bold" | "italic" | "underline" | "bulletList" | "orderedList" | "dashList") => {
    if (command === "bold") {
      editor.chain().focus().toggleBold().run();
      return;
    }
    if (command === "italic") {
      editor.chain().focus().toggleItalic().run();
      return;
    }
    if (command === "underline") {
      editor.chain().focus().toggleUnderline().run();
      return;
    }
    if (command === "bulletList") {
      editor.chain().focus().toggleBulletList().run();
      return;
    }
    if (command === "orderedList") {
      editor.chain().focus().toggleOrderedList().run();
      return;
    }
    if (command === "dashList") {
      // Represent dashed list as a bullet list; styling can be applied when rendering.
      editor.chain().focus().toggleBulletList().run();
    }
  };

  const toolbarButtonClass = (isActive: boolean) =>
    `inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${isActive
      ? "border-primary/50 bg-primary/10 text-primary"
      : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary"
    }`;

  return (
    <SurfaceCard as="div" variant="card" className="space-y-3 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 space-y-1">
          <label htmlFor={`section-heading-${section.id}`} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Section {index + 1} heading
          </label>
          <input
            id={`section-heading-${section.id}`}
            value={section.heading}
            onChange={(event) =>
              onChange({
                ...section,
                heading: event.target.value
              })
            }
            disabled={disabled}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            placeholder={index === 0 ? "Introduction" : "Section heading"}
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={disabled || index === 0}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-secondary disabled:opacity-40"
            aria-label="Move section up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={disabled || index === totalSections - 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-secondary disabled:opacity-40"
            aria-label="Move section down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled || totalSections === 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-destructive/60 bg-background text-destructive hover:bg-destructive/10 disabled:opacity-40"
            aria-label="Delete section"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background shadow-sm">
        <div className="flex flex-wrap items-center gap-1 border-b border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => applyFormatting("bold")}
            disabled={disabled || isAiLoading}
            className={toolbarButtonClass(editor.isActive("bold"))}
            aria-label="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting("italic")}
            disabled={disabled || isAiLoading}
            className={toolbarButtonClass(editor.isActive("italic"))}
            aria-label="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting("underline")}
            disabled={disabled || isAiLoading}
            className={toolbarButtonClass(editor.isActive("underline"))}
            aria-label="Underline"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </button>
          <span className="mx-1 h-4 w-px bg-border/70" aria-hidden />
          <button
            type="button"
            onClick={() => applyFormatting("bulletList")}
            disabled={disabled || isAiLoading}
            className={toolbarButtonClass(editor.isActive("bulletList"))}
            aria-label="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting("orderedList")}
            disabled={disabled || isAiLoading}
            className={toolbarButtonClass(editor.isActive("orderedList"))}
            aria-label="Numbered list"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting("dashList")}
            disabled={disabled || isAiLoading}
            className={toolbarButtonClass(editor.isActive("bulletList"))}
            aria-label="Dashed list"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="mx-1 h-4 w-px bg-border/70" aria-hidden />
          <button
            type="button"
            disabled={disabled || isAiLoading}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50"
            aria-label="AI editing tools"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>AI</span>
          </button>
          <div className="flex flex-wrap items-center gap-1">
            {aiActions.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={disabled || isAiLoading}
                onClick={() => void runAiAction(action.id)}
                className="inline-flex h-7 items-center rounded-md border border-transparent px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
          <div className="ml-auto hidden text-[11px] lg:block">
            Start typing naturally.
          </div>
        </div>
        <EditorContent editor={editor} />
      </div>
    </SurfaceCard>
  );
}

export function BlogRichTextEditor({ sections, onChange, disabled }: BlogRichTextEditorProps) {
  const [aiLoadingSectionId, setAiLoadingSectionId] = useState<string | null>(null);

  const handleSectionChange = (id: string, next: BlogPostSectionDraft) => {
    onChange(
      sections.map((section) => {
        if (section.id === id) {
          return next;
        }
        return section;
      })
    );
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    const index = sections.findIndex((section) => section.id === id);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const nextSections = [...sections];
    const [removed] = nextSections.splice(index, 1);
    nextSections.splice(targetIndex, 0, removed);
    onChange(nextSections);
  };

  const deleteSection = (id: string) => {
    if (sections.length === 1) return;
    onChange(sections.filter((section) => section.id !== id));
  };

  const addSection = () => {
    const nextIndex = sections.length + 1;
    const id = `section-${nextIndex}`;
    onChange([
      ...sections,
      {
        id,
        heading: "",
        content: ""
      }
    ]);
  };

  const runAiForSection = async (sectionId: string, actionId: AiActionId) => {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;

    const text = htmlToPlainText(section.content);
    if (!text) return;

    setAiLoadingSectionId(sectionId);
    try {
      const instructionByAction: Record<AiActionId, string> = {
        "fix-grammar": "Rewrite this blog section with correct grammar, spelling, and punctuation. Preserve the meaning and length as much as possible.",
        "improve-clarity": "Rewrite this blog section to be clearer and easier to understand while keeping the same meaning and roughly the same length.",
        shorten: "Rewrite this blog section to be more concise while preserving the key ideas.",
        expand: "Expand this blog section with a bit more detail and supporting explanation, while keeping it appropriate for a technical blog."
      };

      const response = await fetch("/api/ai/blog-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          instruction: instructionByAction[actionId],
          scope: "section"
        })
      });

      if (!response.ok) {
        return;
      }

      const json = (await response.json()) as { editedText?: string };
      if (!json.editedText) {
        return;
      }

      onChange(
        sections.map((item) =>
          item.id === sectionId
            ? {
              ...item,
              content: plainTextToHtml(json.editedText ?? item.content)
            }
            : item
        )
      );
    } finally {
      setAiLoadingSectionId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div>
          <h2 className="text-sm font-medium text-foreground">Post sections</h2>
          <p className="text-xs text-muted-foreground">
            Create multiple sections with headings, formatting, and AI-assisted editing.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <SectionEditor
            key={section.id}
            section={section}
            index={index}
            totalSections={sections.length}
            onChange={(next) => handleSectionChange(section.id, next)}
            onMoveUp={() => moveSection(section.id, "up")}
            onMoveDown={() => moveSection(section.id, "down")}
            onDelete={() => deleteSection(section.id)}
            onAiEdit={async (action) => {
              await runAiForSection(section.id, action);
            }}
            disabled={disabled || aiLoadingSectionId === section.id}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={addSection}
          disabled={disabled}
          className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Add section</span>
        </button>
      </div>
    </div>
  );
}

