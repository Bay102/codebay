import { useState, useRef, useEffect, useCallback, type CSSProperties } from "react";
import { useForm, Controller, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, Sparkles, UserCircle, Smartphone, Globe, Code2, Zap, ShieldCheck, ArrowRight, ChartBarBig } from "lucide-react";
import { requestHumanConnect, sendChatMessage, type ChatMessage } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const chatFormSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(500, "Message must be 500 characters or less"),
});

/** Formats phone input as (XXX) XXX-XXXX, max 11 digits. Strips non-digits internally. */
function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
}

const humanConnectFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .nullish()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 11 && /^\d+$/.test(digits);
    }, {
      message: "Enter a valid phone number (7–11 digits)",
    }),
  notes: z.string().max(2000, "Notes must be 2000 characters or less").optional().default(""),
  website: z.string().max(0, "Invalid submission").optional().default(""),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;
type HumanConnectFormValues = z.infer<typeof humanConnectFormSchema>;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hey! I'm Anton. Most people land here because they need help with tech—a mobile app, web app, or custom software. What brings you here?",
  },
];

type ConnectStatus = "idle" | "submitting" | "success" | "error";

const CHAT_MIN_INTERVAL_MS = 2500;
const CONNECT_MIN_INTERVAL_MS = 30_000;
const CONNECT_MIN_FILL_MS = 2000;
const CHAT_INPUT_MAX_HEIGHT_PX = 140;

const CAPABILITIES = [
  { icon: Smartphone, label: "Mobile Apps", color: "text-ai-accent" },
  { icon: ChartBarBig, label: "Internal Tools", color: "text-green-500" },
  { icon: Globe, label: "Websites", color: "text-ai-accent" },
  { icon: Code2, label: "Custom Software", color: "text-primary" },
  { icon: Sparkles, label: "AI Integration Services", color: "text-ai-accent" },
] as const;

const OUTCOMES = [
  { icon: ArrowRight, label: "Launch Faster", sub: "MVPs in weeks, not months" },
  { icon: ShieldCheck, label: "Enterprise-Grade Software", sub: "Production-ready quality" },
  { icon: Zap, label: "AI-Accelerated Development", sub: "Speed without compromise" },
] as const;

const ChatSectionCopy = () => (
  <div className="flex flex-col gap-4 md:gap-5">
    <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
      Software Development
      <span aria-hidden="true" className="my-1.5 block h-px w-full max-w-xs bg-gradient-to-r from-primary/80 to-transparent sm:my-2 sm:max-w-sm" />
      <span className="gradient-text">Mobile · Web · Internal Tools</span>
    </h1>
    <p className="text-sm text-foreground/90 leading-relaxed sm:text-base">
      CodeBay helps startups and businesses build production-grade web apps, mobile apps, and custom
      software faster with AI-assisted delivery.
    </p>

    {/* Capability badges */}
    <div className="flex flex-wrap gap-2">
      {CAPABILITIES.map(({ icon: Icon, label, color }, i) => (
        <div
          key={label}
          className="inline-flex animate-in fade-in slide-in-from-bottom-2 items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1.5 backdrop-blur-sm transition-all duration-300 group hover:border-ai-accent/30 hover:bg-ai-accent/10"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <Icon className={`h-3.5 w-3.5 ${color} group-hover:scale-110 transition-transform`} />
          <span className="text-[11px] font-medium text-foreground/90 sm:text-xs">{label}</span>
        </div>
      ))}
    </div>

    {/* Outcome stats */}
    <div className="flex flex-col gap-2 pt-0 md:gap-2.5 md:pt-1">
      {OUTCOMES.map(({ icon: Icon, label, sub }, i) => (
        <div
          key={label}
          className="flex animate-in fade-in slide-in-from-left-3 items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 transition-all duration-300 hover:border-primary/20 hover:bg-primary/5"
          style={{ animationDelay: `${200 + i * 100}ms` }}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface ChatCardProps {
  messages: ChatMessage[];
  isLoading: boolean;
  desktopChatHeight: number | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  chatForm: UseFormReturn<ChatFormValues>;
  onChatSubmit: (values: ChatFormValues) => Promise<void>;
  isConnectOpen: boolean;
  onConnectOpenChange: (open: boolean) => void;
  connectStatus: ConnectStatus;
  connectError: string | null;
  connectForm: UseFormReturn<HumanConnectFormValues>;
  onConnectSubmit: (values: HumanConnectFormValues) => Promise<void>;
}

const ChatCard = ({
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
  const messageBubbleClass = (role: ChatMessage["role"]) =>
    role === "assistant"
      ? "chat-ai-bubble bg-muted/60 text-foreground border border-ai-accent/20"
      : "ml-auto bg-primary/20 border-primary/30 text-foreground shadow-[0_2px_8px_rgba(249,115,22,0.2)]";
  const chatHeightStyle: CSSProperties | undefined = desktopChatHeight
    ? ({ "--desktop-chat-height": `${desktopChatHeight}px` } as CSSProperties)
    : undefined;
  const messageField = chatForm.register("message");
  const messageValue = chatForm.watch("message") ?? "";

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
            <p className="text-sm font-medium flex items-center gap-1.5">
              Anton
              <Sparkles className="h-3 w-3 text-ai-accent" />
            </p>
            <p className="text-xs text-muted-foreground font-mono">Neural AI Assistant</p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-ai-accent/90 bg-ai-accent/10 px-2 py-0.5 rounded border border-ai-accent/30">
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
                  <span
                    key={i}
                    className="text-ai-accent animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
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
          <Dialog open={isConnectOpen} onOpenChange={onConnectOpenChange}>
            <DialogTrigger asChild>
              <button
                type="button"
                disabled={isLoading || connectStatus === "submitting"}
                className="group inline-flex items-center gap-1.5 px-2.5 py-2 leading-none rounded-full text-xs font-medium hover:bg-primary/20 hover:border-primary/40 hover:shadow-[0_0_12px_hsla(24,95%,53%,0.25)] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <UserCircle className="h-3.5 w-3.5" />
                <span className="text-foreground">
                  {connectStatus === "success" ? "Request sent" : "Connect with CodeBay"}
                </span>
              </button>
            </DialogTrigger>
            <DialogContent
              className="connect-dialog sm:max-w-[420px] rounded-xl text-foreground [&>button]:text-muted-foreground [&>button]:hover:text-foreground [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_textarea]:text-foreground [&_textarea]:placeholder:text-muted-foreground [&_input]:focus-visible:ring-ai-accent/40 [&_textarea]:focus-visible:ring-ai-accent/40"
              onOpenAutoFocus={(e) => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  e.preventDefault();
                }
              }}
            >
              <div className="chat-scan-line" />

              <DialogHeader className="relative z-10">
                <DialogTitle className="text-foreground">
                  Connect with <span className="text-ai-accent">CodeBay</span>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Share your contact details and we will follow up, usually within 48 hours. We may use your chat history to
                  better understand your needs.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={connectForm.handleSubmit(onConnectSubmit)} className="relative z-10 grid gap-4">
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                  {...connectForm.register("website")}
                />
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="connect-name">Name</Label>
                    <Input
                      id="connect-name"
                      autoComplete="name"
                      placeholder="Jane Doe"
                      {...connectForm.register("name")}
                      disabled={connectStatus === "submitting"}
                    />
                    {connectForm.formState.errors.name && (
                      <p className="text-xs text-destructive">
                        {connectForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="connect-email">Email</Label>
                    <Input
                      id="connect-email"
                      type="email"
                      autoComplete="email"
                      placeholder="jane@company.com"
                      {...connectForm.register("email")}
                      disabled={connectStatus === "submitting"}
                    />
                    {connectForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {connectForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="connect-phone">Phone</Label>
                    <Controller
                      name="phone"
                      control={connectForm.control}
                      render={({ field }) => (
                        <Input
                          id="connect-phone"
                          placeholder="(555) 123-4567"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          maxLength={18}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const formatted = formatPhoneInput(e.target.value);
                            field.onChange(formatted || undefined);
                          }}
                          onBlur={field.onBlur}
                          disabled={connectStatus === "submitting"}
                        />
                      )}
                    />
                    {connectForm.formState.errors.phone && (
                      <p className="text-xs text-destructive">
                        {connectForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="connect-notes">How can we help?</Label>
                    <Textarea
                      id="connect-notes"
                      placeholder="Any additional context, timeline, or questions..."
                      rows={3}
                      className="resize-none text-base md:text-sm"
                      {...connectForm.register("notes")}
                      disabled={connectStatus === "submitting"}
                    />
                    {connectForm.formState.errors.notes && (
                      <p className="text-xs text-destructive">
                        {connectForm.formState.errors.notes.message}
                      </p>
                    )}
                  </div>
                </div>

                {connectError && (
                  <p className="text-xs text-destructive">{connectError}</p>
                )}

                <DialogFooter className="gap-2 sm:gap-2">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={connectStatus === "submitting"}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={connectStatus === "submitting"}>
                    {connectStatus === "submitting" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Request"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <form
          onSubmit={chatForm.handleSubmit(onChatSubmit)}
          className="chat-input-bar flex items-end gap-2 rounded-lg border px-3 py-2 shadow-lg backdrop-blur-md transition-all hover:border-ai-accent/35 hover:shadow-[0_0_24px_hsla(187,85%,53%,0.1)] md:px-3 md:py-2 md:shadow-[0_0_20px_hsla(187,85%,53%,0.06)]"
        >
          <span className="mb-2 font-mono text-base font-semibold text-ai-accent select-none md:mb-1.5 md:text-sm">›</span>
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
            className="max-h-[140px] w-full resize-none border-0 bg-transparent py-0.5 font-mono text-[1.05rem] leading-6 text-foreground placeholder:text-muted-foreground caret-foreground focus-visible:outline-none md:text-sm md:leading-5"
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
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

const ChatSection = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>("idle");
  const [connectError, setConnectError] = useState<string | null>(null);
  const [desktopChatHeight, setDesktopChatHeight] = useState<number | null>(null);
  const ctaPanelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastChatSubmitAtRef = useRef(0);
  const lastConnectSubmitAtRef = useRef(0);
  const connectFormOpenedAtRef = useRef<number | null>(null);

  const chatForm = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: "" },
  });

  const connectForm = useForm<HumanConnectFormValues>({
    resolver: zodResolver(humanConnectFormSchema),
    defaultValues: { name: "", email: "", phone: undefined, notes: "", website: "" },
  });

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ctaPanel = ctaPanelRef.current;
    if (!ctaPanel) return;

    const updateDesktopChatHeight = () => {
      const nextHeight = Math.round(ctaPanel.getBoundingClientRect().height);
      if (nextHeight > 0) {
        setDesktopChatHeight(nextHeight);
      }
    };

    updateDesktopChatHeight();
    const resizeObserver = new ResizeObserver(updateDesktopChatHeight);
    resizeObserver.observe(ctaPanel);
    window.addEventListener("resize", updateDesktopChatHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDesktopChatHeight);
    };
  }, []);

  const onChatSubmit = async (values: ChatFormValues) => {
    const now = Date.now();
    const elapsedSinceLastSubmit = now - lastChatSubmitAtRef.current;
    if (elapsedSinceLastSubmit < CHAT_MIN_INTERVAL_MS) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "You're sending messages too quickly. Please wait a moment and try again.",
        },
      ]);
      return;
    }

    lastChatSubmitAtRef.current = now;
    const trimmedMessage = values.message.trim();
    const userMessage: ChatMessage = { role: "user", content: trimmedMessage };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    chatForm.reset();
    setIsLoading(true);

    try {
      const response = await sendChatMessage(updatedMessages);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your message. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectOpenChange = (open: boolean) => {
    setIsConnectOpen(open);
    if (open) {
      setConnectError(null);
      if (connectStatus !== "submitting") setConnectStatus("idle");
      connectForm.reset();
      connectFormOpenedAtRef.current = Date.now();
    }
  };

  const onConnectSubmit = async (values: HumanConnectFormValues) => {
    const now = Date.now();
    const elapsedSinceLastSubmit = now - lastConnectSubmitAtRef.current;
    if (elapsedSinceLastSubmit < CONNECT_MIN_INTERVAL_MS) {
      setConnectStatus("error");
      setConnectError("Please wait before sending another request.");
      return;
    }

    const formFillMs = connectFormOpenedAtRef.current ? now - connectFormOpenedAtRef.current : 0;
    if (formFillMs > 0 && formFillMs < CONNECT_MIN_FILL_MS) {
      setConnectStatus("error");
      setConnectError("Please review your details before submitting.");
      return;
    }

    if (values.website?.trim()) {
      setConnectStatus("error");
      setConnectError("Unable to submit your request right now.");
      return;
    }

    lastConnectSubmitAtRef.current = now;
    setConnectStatus("submitting");
    setConnectError(null);

    const trimmedPhone = values.phone?.trim();
    const trimmedNotes = values.notes?.trim();
    const response = await requestHumanConnect({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: trimmedPhone && trimmedPhone.length > 0 ? trimmedPhone : null,
      notes: trimmedNotes && trimmedNotes.length > 0 ? trimmedNotes : null,
      messages,
      antiBot: {
        formFillMs,
      },
    });

    if (!response.success) {
      setConnectStatus("error");
      setConnectError(response.error ?? "Unable to submit your request.");
      return;
    }

    connectForm.reset();
    setConnectStatus("success");
    setIsConnectOpen(false);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Thanks! A human specialist will reach out shortly.",
      },
    ]);
  };

  return (
    <div className="flex w-full min-h-full items-start justify-center md:h-full md:items-center">
      <div className="w-full max-w-5xl md:max-h-[calc(100dvh-9rem)] md:overflow-y-auto lg:max-h-none lg:overflow-visible">
        <div className="flex flex-col md:flex-row md:items-stretch md:justify-between md:gap-12">
          <div
            ref={ctaPanelRef}
            className="home-card-surface order-1 mb-4 w-full rounded-xl border border-border p-4 shadow-xl md:mb-0 md:flex-1 md:p-8 dark:border-white/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          >
            <ChatSectionCopy />
          </div>
          <div className="order-2 w-full md:flex md:min-w-[28rem] md:w-auto md:flex-shrink-0 md:flex-col mb-4 md:mb-0">
            <ChatCard
              messages={messages}
              isLoading={isLoading}
              desktopChatHeight={desktopChatHeight}
              messagesEndRef={messagesEndRef}
              messagesContainerRef={messagesContainerRef}
              chatForm={chatForm}
              onChatSubmit={onChatSubmit}
              isConnectOpen={isConnectOpen}
              onConnectOpenChange={handleConnectOpenChange}
              connectStatus={connectStatus}
              connectError={connectError}
              connectForm={connectForm}
              onConnectSubmit={onConnectSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
