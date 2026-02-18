import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatHandoffRecord } from "../../../../supabase/api/api";
import { parseChatHistoryMessages, serializeChatHistory } from "./admin-utils";

type AdminChatHistoryDialogProps = {
  selectedHandoff: ChatHandoffRecord | null;
  onOpenChange: (open: boolean) => void;
};

export const AdminChatHistoryDialog = ({
  selectedHandoff,
  onOpenChange,
}: AdminChatHistoryDialogProps) => {
  const selectedChatHistoryMessages = useMemo(
    () => parseChatHistoryMessages(selectedHandoff?.chat_history),
    [selectedHandoff]
  );
  const selectedSerializedChatHistory = useMemo(
    () => serializeChatHistory(selectedHandoff?.chat_history),
    [selectedHandoff]
  );

  return (
    <Dialog open={selectedHandoff !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chat History</DialogTitle>
          <DialogDescription>
            Full conversation context for {selectedHandoff?.name ?? "selected lead"}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <div>
            <span className="font-medium text-foreground">Lead:</span> {selectedHandoff?.name ?? "—"}
          </div>
          <div className="truncate">
            <span className="font-medium text-foreground">Email:</span> {selectedHandoff?.email ?? "—"}
          </div>
          <div className="text-right sm:text-left">
            <span className="font-medium text-foreground">Messages:</span>{" "}
            {selectedChatHistoryMessages.length}
          </div>
        </div>

        <ScrollArea className="max-h-[65vh] rounded-lg border border-border/60 bg-card/50 p-4">
          {selectedChatHistoryMessages.length > 0 ? (
            <div className="space-y-3">
              {selectedChatHistoryMessages.map((message, index) => {
                const isAssistant = message.role.toLowerCase() === "assistant";

                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-lg border px-3 py-2 ${
                      isAssistant
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/60 bg-muted/30"
                    }`}
                  >
                    <p className="mb-1 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
                      {message.role}
                    </p>
                    <p className="text-sm whitespace-pre-wrap text-foreground">{message.content}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <pre className="font-mono text-xs whitespace-pre-wrap break-words text-foreground/85">
              {selectedSerializedChatHistory}
            </pre>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
