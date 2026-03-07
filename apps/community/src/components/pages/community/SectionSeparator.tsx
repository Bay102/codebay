export function SectionSeparator() {
  return (
    <div
      className="relative flex items-center justify-center gap-3 px-4 my-12"
      aria-hidden
    >
      <div
        className="h-px flex-1 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--border)) 30%, hsl(var(--primary) / 0.4) 50%, hsl(var(--border)) 70%, transparent 100%)",
        }}
      />
      <span
        className="shrink-0 rounded-full border border-primary/40 bg-primary/15"
        style={{ width: 6, height: 6 }}
      />
      <div
        className="h-px flex-1 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--border)) 30%, hsl(var(--primary) / 0.4) 50%, hsl(var(--border)) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}
