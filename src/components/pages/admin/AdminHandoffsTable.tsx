import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ChatHandoffRecord } from "../../../../supabase/api/api";
import {
  formatTextCell,
  formatTimestamp,
  getChatHistoryMessageCount,
  getChatHistoryPreviewText,
  serializeChatHistory,
} from "./admin-utils";

type AdminHandoffsTableProps = {
  records: ChatHandoffRecord[];
  isLoading: boolean;
  emptyMessage: string;
  updatingArchivedById: Record<string, boolean>;
  onSelectHandoff: (handoff: ChatHandoffRecord) => void;
  onToggleArchived: (handoffId: string, currentArchived: boolean | null) => Promise<void>;
};

export const AdminHandoffsTable = ({
  records,
  isLoading,
  emptyMessage,
  updatingArchivedById,
  onSelectHandoff,
  onToggleArchived,
}: AdminHandoffsTableProps) => (
  <Table className="min-w-[1080px]">
    <TableHeader>
      <TableRow>
        <TableHead>created_at</TableHead>
        <TableHead>name</TableHead>
        <TableHead>email</TableHead>
        <TableHead>phone</TableHead>
        <TableHead>chat_history</TableHead>
        <TableHead>notes</TableHead>
        <TableHead>archived</TableHead>
        <TableHead>actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {isLoading ? (
        <TableRow>
          <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading chat handoffs...
            </div>
          </TableCell>
        </TableRow>
      ) : records.length === 0 ? (
        <TableRow>
          <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
            {emptyMessage}
          </TableCell>
        </TableRow>
      ) : (
        records.map((handoff) => {
          const serializedChatHistory = serializeChatHistory(handoff.chat_history);
          const chatHistoryPreview = getChatHistoryPreviewText(handoff.chat_history);
          const messageCount = getChatHistoryMessageCount(handoff.chat_history);
          const isArchived = handoff.archived === true;
          const isUpdatingArchived = updatingArchivedById[handoff.id] === true;

          return (
            <TableRow key={handoff.id}>
              <TableCell className="whitespace-nowrap text-xs">
                {formatTimestamp(handoff.created_at)}
              </TableCell>
              <TableCell>{handoff.name}</TableCell>
              <TableCell className="max-w-[220px] truncate" title={handoff.email}>
                {handoff.email}
              </TableCell>
              <TableCell>{formatTextCell(handoff.phone)}</TableCell>
              <TableCell className="max-w-[360px]">
                <button
                  type="button"
                  onClick={() => onSelectHandoff(handoff)}
                  className="w-full rounded-md p-1 text-left transition-colors hover:bg-muted/40"
                  title="Open full chat history"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{messageCount} messages</p>
                    <p className="font-mono text-xs text-foreground/80" title={serializedChatHistory}>
                      {chatHistoryPreview}
                    </p>
                  </div>
                </button>
              </TableCell>
              <TableCell className="max-w-[240px]">
                <p className="truncate" title={formatTextCell(handoff.notes)}>
                  {formatTextCell(handoff.notes)}
                </p>
              </TableCell>
              <TableCell>
                <Badge variant={isArchived ? "secondary" : "default"}>
                  {isArchived ? "true" : "false"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  size="sm"
                  variant={isArchived ? "secondary" : "default"}
                  disabled={isUpdatingArchived}
                  onClick={() => void onToggleArchived(handoff.id, handoff.archived)}
                  className="min-w-28"
                >
                  {isUpdatingArchived ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving
                    </>
                  ) : isArchived ? (
                    "Mark as New"
                  ) : (
                    "Mark as Read"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          );
        })
      )}
    </TableBody>
  </Table>
);
