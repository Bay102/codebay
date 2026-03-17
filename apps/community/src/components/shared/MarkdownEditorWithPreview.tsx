 "use client";

 import { useState } from "react";

 type MarkdownEditorWithPreviewProps = {
   id: string;
   label: string;
   value: string;
   onChange: (next: string) => void;
   placeholder?: string;
   disabled?: boolean;
   rows?: number;
   /** Optional helper text shown below the label. */
   description?: string;
 };

 export function MarkdownEditorWithPreview({
   id,
   label,
   value,
   onChange,
   placeholder,
   disabled,
   rows = 6,
   description
 }: MarkdownEditorWithPreviewProps) {
   const [mode, setMode] = useState<"edit" | "preview">("edit");

   const handleTabClick = (nextMode: "edit" | "preview") => {
     if (disabled) return;
     setMode(nextMode);
   };

   return (
     <div className="space-y-2">
       <div className="flex items-center justify-between gap-2">
         <div>
           <label htmlFor={id} className="block text-sm font-medium text-foreground">
             {label}
           </label>
           {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
         </div>
         <div className="inline-flex items-center rounded-full border border-border bg-muted/40 p-0.5 text-xs">
           <button
             type="button"
             onClick={() => handleTabClick("edit")}
             className={[
               "rounded-full px-2.5 py-1 transition-colors",
               mode === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
             ].join(" ")}
             disabled={disabled}
           >
             Write
           </button>
           <button
             type="button"
             onClick={() => handleTabClick("preview")}
             className={[
               "rounded-full px-2.5 py-1 transition-colors",
               mode === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
             ].join(" ")}
             disabled={disabled}
           >
             Preview
           </button>
         </div>
       </div>

       {mode === "edit" ? (
         <>
           <textarea
             id={id}
             value={value}
             onChange={(event) => onChange(event.target.value)}
             placeholder={placeholder}
             disabled={disabled}
             rows={rows}
             className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
           />
           <p className="text-[11px] text-muted-foreground">
             Supports basic Markdown: <code className="rounded bg-muted px-1 py-0.5">**bold**</code>,{" "}
             <code className="rounded bg-muted px-1 py-0.5">*italic*</code>,{" "}
             <code className="rounded bg-muted px-1 py-0.5">`code`</code>, lists, and links.
           </p>
         </>
       ) : (
         <div className="mt-1 min-h-[120px] w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
           {value.trim() ? (
             <pre className="whitespace-pre-wrap break-words text-sm">{value}</pre>
           ) : (
             <p className="text-sm text-muted-foreground">Nothing to preview yet. Start writing your discussion.</p>
           )}
         </div>
       )}
     </div>
   );
 }

