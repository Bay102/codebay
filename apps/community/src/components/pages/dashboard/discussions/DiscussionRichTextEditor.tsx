 "use client";

 import { useEffect } from "react";
 import { Bold, Italic, List, ListOrdered, Code, Code2 } from "lucide-react";
 import { EditorContent, useEditor } from "@tiptap/react";
 import StarterKit from "@tiptap/starter-kit";

 type DiscussionRichTextEditorProps = {
   id: string;
   value: string;
   onChange: (next: string) => void;
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

 export function DiscussionRichTextEditor({ id, value, onChange, disabled }: DiscussionRichTextEditorProps) {
   const editor = useEditor(
     {
       extensions: [StarterKit],
       content: plainTextToHtml(value),
       editable: !disabled,
       editorProps: {
         attributes: {
           id,
           class:
             "min-h-[220px] px-3 py-2 text-[15px] leading-7 text-foreground outline-none [&_p]:my-1 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_strong]:font-semibold [&_em]:italic [&_code]:rounded-[4px] [&_code]:bg-muted/80 [&_code]:px-1 [&_code]:py-0.5 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted/80 [&_pre]:p-3"
         }
       },
       onUpdate: ({ editor: nextEditor }) => {
         onChange(nextEditor.getHTML());
       }
     },
     [id]
   );

   useEffect(() => {
     if (!editor) return;
     const nextContent = plainTextToHtml(value);
     const currentContent = editor.getHTML();
     if (currentContent !== nextContent) {
       editor.commands.setContent(nextContent, false);
     }
   }, [editor, value]);

   if (!editor) {
     return null;
   }

   const apply = (command: "bold" | "italic" | "bulletList" | "orderedList" | "inlineCode" | "codeBlock") => {
     if (command === "bold") {
       editor.chain().focus().toggleBold().run();
       return;
     }
     if (command === "italic") {
       editor.chain().focus().toggleItalic().run();
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
     if (command === "inlineCode") {
       editor.chain().focus().toggleCode().run();
       return;
     }
     if (command === "codeBlock") {
       editor.chain().focus().toggleCodeBlock().run();
     }
   };

   const toolbarButtonClass = (isActive: boolean) =>
     `inline-flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground transition-colors ${
       isActive ? "border-primary/50 bg-primary/10 text-primary" : "border-transparent hover:border-border hover:bg-secondary"
     }`;

   return (
     <div className="space-y-2">
       <div className="flex items-center justify-between gap-2">
         <p className="text-sm font-medium text-foreground">Body</p>
         <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
           <span>Formatting</span>
           <span className="hidden sm:inline">supports bold, lists, and code</span>
         </div>
       </div>
       <div className="rounded-2xl border border-border/70 bg-background shadow-sm">
         <div className="flex flex-wrap items-center gap-1 border-b border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
           <button
             type="button"
             onClick={() => apply("bold")}
             disabled={disabled}
             className={toolbarButtonClass(editor.isActive("bold"))}
             aria-label="Bold"
           >
             <Bold className="h-3.5 w-3.5" />
           </button>
           <button
             type="button"
             onClick={() => apply("italic")}
             disabled={disabled}
             className={toolbarButtonClass(editor.isActive("italic"))}
             aria-label="Italic"
           >
             <Italic className="h-3.5 w-3.5" />
           </button>
           <span className="mx-1 h-4 w-px bg-border/70" aria-hidden />
           <button
             type="button"
             onClick={() => apply("bulletList")}
             disabled={disabled}
             className={toolbarButtonClass(editor.isActive("bulletList"))}
             aria-label="Bullet list"
           >
             <List className="h-3.5 w-3.5" />
           </button>
           <button
             type="button"
             onClick={() => apply("orderedList")}
             disabled={disabled}
             className={toolbarButtonClass(editor.isActive("orderedList"))}
             aria-label="Numbered list"
           >
             <ListOrdered className="h-3.5 w-3.5" />
           </button>
           <span className="mx-1 h-4 w-px bg-border/70" aria-hidden />
           <button
             type="button"
             onClick={() => apply("inlineCode")}
             disabled={disabled}
             className={toolbarButtonClass(editor.isActive("code"))}
             aria-label="Inline code"
           >
             <Code className="h-3.5 w-3.5" />
           </button>
           <button
             type="button"
             onClick={() => apply("codeBlock")}
             disabled={disabled}
             className={toolbarButtonClass(editor.isActive("codeBlock"))}
             aria-label="Code block"
           >
             <Code2 className="h-3.5 w-3.5" />
           </button>
         </div>
         <EditorContent editor={editor} />
       </div>
       <p className="text-[11px] text-muted-foreground">
         Share enough context so others can help. You can use bold, lists, and inline or block code for snippets.
       </p>
     </div>
   );
 }

