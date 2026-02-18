import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ChatHandoffRecord } from "../../../../supabase/api/api";
import { AdminHandoffsTable } from "./AdminHandoffsTable";

type AdminHandoffsSectionProps = {
  error: string | null;
  actionError: string | null;
  authError: string | null;
  isLoading: boolean;
  newHandoffs: ChatHandoffRecord[];
  archivedHandoffs: ChatHandoffRecord[];
  isArchivedOpen: boolean;
  onArchivedOpenChange: (open: boolean) => void;
  updatingArchivedById: Record<string, boolean>;
  onSelectHandoff: (handoff: ChatHandoffRecord) => void;
  onToggleArchived: (handoffId: string, currentArchived: boolean | null) => Promise<void>;
};

export const AdminHandoffsSection = ({
  error,
  actionError,
  authError,
  isLoading,
  newHandoffs,
  archivedHandoffs,
  isArchivedOpen,
  onArchivedOpenChange,
  updatingArchivedById,
  onSelectHandoff,
  onToggleArchived,
}: AdminHandoffsSectionProps) => (
  <section className="space-y-4">
    {error ? (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Failed to load handoffs: {error}
      </div>
    ) : null}
    {actionError ? (
      <div className="mt-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Failed to update lead: {actionError}
      </div>
    ) : null}
    {authError ? (
      <div className="mt-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Auth error: {authError}
      </div>
    ) : null}

    <div className="glass-nav rounded-2xl border border-border/60 p-2 sm:p-3">
      <div className="px-3 pt-2 pb-3">
        <h2 className="text-base font-semibold text-foreground">New Chats</h2>
        <p className="text-sm text-muted-foreground">Incoming chat handoffs that are not archived.</p>
      </div>
      <AdminHandoffsTable
        records={newHandoffs}
        isLoading={isLoading}
        emptyMessage="No new chats in `chat_handoffs`."
        updatingArchivedById={updatingArchivedById}
        onSelectHandoff={onSelectHandoff}
        onToggleArchived={onToggleArchived}
      />
    </div>

    <Collapsible
      open={isArchivedOpen}
      onOpenChange={onArchivedOpenChange}
      className="glass-nav rounded-2xl border border-border/60 p-2 sm:p-3"
    >
      <div className="flex flex-col gap-3 px-3 pt-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Archived Chats</h2>
          <p className="text-sm text-muted-foreground">Handoffs that were marked as read/archived.</p>
        </div>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto">
            {isArchivedOpen ? "Hide Archived Chats" : "Show Archived Chats"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isArchivedOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <AdminHandoffsTable
          records={archivedHandoffs}
          isLoading={isLoading}
          emptyMessage="No archived chats in `chat_handoffs`."
          updatingArchivedById={updatingArchivedById}
          onSelectHandoff={onSelectHandoff}
          onToggleArchived={onToggleArchived}
        />
      </CollapsibleContent>
    </Collapsible>
  </section>
);
