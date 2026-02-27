"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { ConnectDialog } from "@/components/pages/home/sections/Anton/ConnectDialog";
import { CHAT_INPUT_MAX_HEIGHT_PX, type ChatFormValues, type ConnectStatus, type HumanConnectFormValues } from "@/components/pages/home/sections/Anton/chatForms";
import type { UseFormReturn } from "react-hook-form";

interface ChatCardProps {
  messages: ChatMessage[];
  isLoading: boolean;
  desktopChatHeight: number | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  chatForm: UseFormReturn<ChatFormValues>;
  onChatSubmit: (values: ChatFormValues) => Promise<void>;
  isConnectOpen: boolean;
  onConnectOpenChange: (open: boolean) => void;
  connectStatus: ConnectStatus;
  connectError: string | null;
  connectForm: UseFormReturn<HumanConnectFormValues>;
  onConnectSubmit: (values: HumanConnectFormValues) => Promise<void>;
}

export const ChatCard = ({
  messages,
  isLoading,
  desktopChatHeight,
  messagesEndRef,
  messagesContainerRef,
  chatForm,
  onChatSubmit,
  isConnectOpen,
  onConnectOpenChange,
  connectStatus,
  connectError,
  connectForm,
  onConnectSubmit,
}: ChatCardProps) => {
  const isFxActive = isLoading || isConnectOpen;
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);
  const messageField = chatForm.register("message");
  const messageValue = chatForm.watch("message") ?? "";
  const chatHeightStyle: CSSProperties | undefined = desktopChatHeight
    ? ({ "--desktop-chat-height": `${desktopChatHeight}px` } as CSSProperties)
    : undefined;

  const messageBubbleClass = (role: ChatMessage["role"]) =>
    role === "assistant"
      ? "chat-ai-bubble border border-ai-accent/20 bg-muted/60 text-foreground"
      : "ml-auto border-primary/30 bg-primary/20 text-foreground shadow-[0_2px_8px_rgba(249,115,22,0.2)]";

  const resizeChatInput = useCallback(() => {
    const input = chatInputRef.current;
    if (!input) return;

    input.style.height = "0px";
    const nextHeight = Math.min(input.scrollHeight, CHAT_INPUT_MAX_HEIGHT_PX);
    input.style.height = `${nextHeight}px`;
    input.style.overflowY = input.scrollHeight > CHAT_INPUT_MAX_HEIGHT_PX ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    resizeChatInput();
  }, [messageValue, resizeChatInput]);

  return (
    <div
      className={`chat-container relative grid w-full max-w-none animate-in fade-in zoom-in-95 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-xl text-foreground shadow-2xl !h-[475px] !min-h-[475px] !max-h-[415px] md:mx-auto md:max-w-md md:!h-[var(--desktop-chat-height,415px)] md:!min-h-[var(--desktop-chat-height,415px)] md:!max-h-[var(--desktop-chat-height,415px)] ${isFxActive ? "chat-container-active" : ""}`}
      style={chatHeightStyle}
    >
      {isFxActive && <div className="chat-scan-line" />}

      <div className="chat-header-bar relative z-10 flex items-center justify-between border-b px-3 py-2.5 md:px-4 md:py-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ai-accent shadow-[0_0_8px_hsl(var(--ai-accent))]" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium">
              Anton
              <Sparkles className="h-3 w-3 text-ai-accent" />
            </p>
            <p className="font-mono text-xs text-muted-foreground">Neural AI Assistant</p>
          </div>
        </div>
        <span className="rounded border border-ai-accent/30 bg-ai-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-ai-accent/90">
          AI
        </span>
      </div>

      <div
        ref={messagesContainerRef}
        className="relative z-10 min-h-0 space-y-2 overflow-y-auto overscroll-contain px-3 py-2 md:space-y-3 md:px-4 md:py-3"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] animate-message-slide rounded-lg border border-border px-3 py-2 text-sm leading-relaxed backdrop-blur-sm transition-all hover:scale-[1.02] ${messageBubbleClass(
              message.role
            )}`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="chat-ai-bubble max-w-[85%] animate-message-slide rounded-lg border border-ai-accent/20 bg-muted/60 px-3 py-2 text-sm leading-relaxed text-foreground backdrop-blur-sm">
            <div className="flex items-center gap-2 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ai-accent/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ai-accent" />
              </span>
              <span className="text-ai-accent/95">Processing</span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="animate-pulse text-ai-accent" style={{ animationDelay: `${i * 0.2}s` }}>
                    .
                  </span>
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/90 via-background/55 to-transparent md:hidden" />

      <div className="relative z-10 space-y-2 border-t border-border/50 bg-transparent px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-md md:border-t-0 md:px-4 md:pb-4 md:backdrop-blur-0">
        <div className="flex items-center justify-end pt-2">
          <ConnectDialog
            isOpen={isConnectOpen}
            isLoadingChat={isLoading}
            status={connectStatus}
            error={connectError}
            form={connectForm}
            onOpenChange={onConnectOpenChange}
            onSubmit={onConnectSubmit}
          />
        </div>

        <form
          onSubmit={chatForm.handleSubmit(onChatSubmit)}
          className="chat-input-bar flex items-end gap-2 rounded-lg border px-3 py-2 shadow-lg backdrop-blur-md transition-all hover:border-ai-accent/35 hover:shadow-[0_0_24px_hsla(187,85%,53%,0.1)] md:px-3 md:py-2 md:shadow-[0_0_20px_hsla(187,85%,53%,0.06)]"
        >
          <span className="mb-2 select-none font-mono text-base font-semibold text-ai-accent md:mb-1.5 md:text-sm">›</span>
          <textarea
            {...messageField}
            placeholder="What can we help you with?"
            rows={1}
            ref={(element) => {
              messageField.ref(element);
              chatInputRef.current = element;
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
              event.preventDefault();
              const trimmedMessage = chatForm.getValues("message").trim();
              if (!trimmedMessage || isLoading) return;
              void chatForm.handleSubmit(onChatSubmit)();
            }}
            className="max-h-[140px] w-full resize-none border-0 bg-transparent py-0.5 font-mono text-[1.05rem] leading-6 text-foreground caret-foreground placeholder:text-muted-foreground focus-visible:outline-none md:text-sm md:leading-5"
            disabled={isLoading}
            autoComplete="off"
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={isLoading || !messageValue.trim()}
            size="sm"
            className="h-9 min-w-9 px-2.5 transition-all hover:scale-110 disabled:opacity-50 md:h-8 md:min-w-8 md:px-2"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </Button>
        </form>
      </div>
    </div>
  );
};
