import { useState, useRef, useEffect, useCallback } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, Sparkles, UserCircle, Smartphone, Globe, Code2, Zap, ShieldCheck, ArrowRight } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import PhoneInputWithCountry from "react-phone-number-input/react-hook-form";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const chatFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

const humanConnectFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .nullish()
    .refine((value) => !value || isPossiblePhoneNumber(value), {
      message: "Enter a valid phone number",
    }),
  notes: z.string().max(2000, "Notes must be 2000 characters or less").optional().default(""),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;
type HumanConnectFormValues = z.infer<typeof humanConnectFormSchema>;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hey! I'm Anton. Most people land here with an idea—a mobile app, web app, or custom software. What are you looking to build?",
  },
];

type ConnectStatus = "idle" | "submitting" | "success" | "error";

const CAPABILITIES = [
  { icon: Smartphone, label: "Mobile Apps", color: "text-[hsl(187,85%,53%)]" },
  { icon: Globe, label: "Web Apps", color: "text-[hsl(187,85%,53%)]" },
  { icon: Code2, label: "Custom Software", color: "text-primary" },
  { icon: Sparkles, label: "AI Integration", color: "text-[hsl(187,85%,53%)]" },
] as const;

const OUTCOMES = [
  { icon: ArrowRight, label: "Months → Weeks", sub: "Delivery speed" },
  { icon: ShieldCheck, label: "Professional Grade", sub: "Enterprise quality" },
  { icon: Zap, label: "Zero Compromise", sub: "Speed + quality" },
] as const;

const ChatSectionCopy = () => (
  <div className="flex flex-col gap-4 md:gap-5">
    <h1 className="text-3xl sm:text-4xl md:text-4xl font-light tracking-tight text-foreground">
      AI-Driven Development,
      <span className="gradient-text"> Shipped at Insane Speed</span>
    </h1>
    <p className="text-sm sm:text-base text-white/90 leading-relaxed">
      We&apos;re a tech agency that builds professional-grade software using AI, delivering months of
      work in weeks without compromising quality.
    </p>

    {/* Capability badges */}
    <div className="flex flex-wrap gap-2">
      {CAPABILITIES.map(({ icon: Icon, label, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:border-[hsla(187,85%,53%,0.3)] hover:bg-[hsla(187,85%,53%,0.06)] transition-all duration-300 group"
        >
          <Icon className={`h-3.5 w-3.5 ${color} group-hover:scale-110 transition-transform`} />
          <span className="text-xs sm:text-sm font-medium text-white/90">{label}</span>
        </motion.div>
      ))}
    </div>

    {/* Outcome stats */}
    <div className="flex flex-col gap-2 md:gap-2.5 pt-0 md:pt-1">
      {OUTCOMES.map(({ icon: Icon, label, sub }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

interface ChatCardProps {
  messages: ChatMessage[];
  isLoading: boolean;
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
  const messageBubbleClass = (role: ChatMessage["role"]) =>
    role === "assistant"
      ? "chat-ai-bubble bg-muted/60 text-foreground border border-[hsla(187,85%,53%,0.15)]"
      : "ml-auto bg-primary/20 border-primary/30 text-foreground shadow-[0_2px_8px_rgba(249,115,22,0.2)]";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -24, 0],
      }}
      transition={{
        opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        y: {
          duration: 10,
          repeat: Infinity,
          ease: [0.37, 0, 0.63, 1],
          times: [0, 0.5, 1],
          delay: 0.5,
        },
      }}
      className="w-full max-w-none md:max-w-md md:mx-auto chat-container text-foreground flex flex-col h-[340px] md:flex-1 md:min-h-0 shadow-2xl relative rounded-xl overflow-hidden"
    >
      <div className="chat-scan-line" />

      <div className="flex items-center justify-between border-b border-[hsla(187,85%,53%,0.15)] bg-[hsla(0,0%,0%,0.3)] px-3 py-2.5 md:px-4 md:py-3 relative z-10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsla(187,85%,53%,0.6)]" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[hsl(187,85%,53%)] shadow-[0_0_8px_hsl(187,85%,53%)]" />
          </span>
          <div>
            <p className="text-sm font-medium flex items-center gap-1.5">
              Anton
              <Sparkles className="h-3 w-3 text-[hsl(187,85%,53%)]" />
            </p>
            <p className="text-xs text-muted-foreground font-mono">Neural AI Assistant</p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[hsla(187,85%,53%,0.9)] bg-[hsla(187,85%,53%,0.1)] px-2 py-0.5 rounded border border-[hsla(187,85%,53%,0.3)]">
          AI
        </span>
      </div>

      <div ref={messagesContainerRef} className="flex-1 min-h-0 space-y-2 md:space-y-3 px-3 md:px-4 py-2 md:py-3 overflow-y-auto relative z-10">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={`${message.role}-${index}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
                delay: index === messages.length - 1 ? 0.1 : 0,
              }}
              className={`max-w-[85%] border border-border px-3 py-2 text-sm leading-relaxed rounded-lg backdrop-blur-sm transition-all hover:scale-[1.02] ${messageBubbleClass(
                message.role
              )}`}
            >
              {message.content}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="chat-ai-bubble max-w-[85%] border border-[hsla(187,85%,53%,0.15)] px-3 py-2 text-sm leading-relaxed bg-muted/60 text-foreground rounded-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsla(187,85%,53%,0.6)]" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(187,85%,53%)]" />
              </span>
              <span className="text-[hsla(187,85%,53%,0.95)]">Processing</span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="text-[hsl(187,85%,53%)]"
                  >
                    .
                  </motion.span>
                ))}
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 md:px-4 pb-3 md:pb-4 relative z-10 space-y-2">
        <div className="flex items-center justify-end">
          <Dialog open={isConnectOpen} onOpenChange={onConnectOpenChange}>
            <DialogTrigger asChild>
              <button
                type="button"
                disabled={isLoading || connectStatus === "submitting"}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 hover:shadow-[0_0_12px_hsla(24,95%,53%,0.25)] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <UserCircle className="h-3.5 w-3.5" />
                {connectStatus === "success" ? "Request sent" : "Connect with CodeBay"}
              </button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[420px] bg-white text-gray-900 [&_input]:bg-white [&_input]:border-gray-200 [&_input]:text-gray-900 [&_textarea]:bg-white [&_textarea]:border-gray-200 [&_textarea]:text-gray-900 [&_.text-muted-foreground]:text-gray-500 [&_.PhoneInput]:border-gray-200 [&_.PhoneInput]:bg-white [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-gray-900"
              onOpenAutoFocus={(e) => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  e.preventDefault();
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>Connect with CodeBay</DialogTitle>
                <DialogDescription>
                  Share your contact details and we will follow up. We may use your chat history to
                  better understand your needs.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={connectForm.handleSubmit(onConnectSubmit)} className="grid gap-4">
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
                    <Label htmlFor="connect-phone">Phone (optional)</Label>
                    <PhoneInputWithCountry
                      id="connect-phone"
                      name="phone"
                      control={connectForm.control}
                      defaultCountry="US"
                      placeholder="Enter phone number"
                      disabled={connectStatus === "submitting"}
                      limitMaxLength
                    />
                    {connectForm.formState.errors.phone && (
                      <p className="text-xs text-destructive">
                        {connectForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="connect-notes">Notes (optional)</Label>
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
          className="flex items-center gap-2 border border-[hsla(187,85%,53%,0.2)] bg-[hsla(0,0%,0%,0.4)] backdrop-blur-sm px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg transition-all shadow-[0_0_20px_hsla(187,85%,53%,0.06)] hover:border-[hsla(187,85%,53%,0.35)] hover:shadow-[0_0_24px_hsla(187,85%,53%,0.1)]"
        >
          <span className="text-[hsl(187,85%,53%)] font-mono font-semibold text-sm select-none">›</span>
          <Input
            {...chatForm.register("message")}
            placeholder="Ask about your product, timeline, or tech stack..."
            className="w-full border-0 bg-transparent text-base md:text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
            disabled={isLoading}
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={isLoading || !chatForm.watch("message")?.trim()}
            size="sm"
            className="transition-all hover:scale-110 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

const ChatSection = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>("idle");
  const [connectError, setConnectError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const chatForm = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: "" },
  });

  const connectForm = useForm<HumanConnectFormValues>({
    resolver: zodResolver(humanConnectFormSchema),
    defaultValues: { name: "", email: "", phone: undefined, notes: "" },
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

  const onChatSubmit = async (values: ChatFormValues) => {
    const userMessage: ChatMessage = { role: "user", content: values.message };
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
    }
  };

  const onConnectSubmit = async (values: HumanConnectFormValues) => {
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
    <div className="w-full min-h-full md:h-full flex items-center justify-center md:pt-12">
      <div className="w-full max-w-5xl px-3 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-stretch md:gap-12 md:justify-between">
          <div className="order-1 w-full md:flex-1 mb-4 md:mb-0 p-4 md:p-8 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <ChatSectionCopy />
          </div>
          <div className="order-2 w-full md:w-auto md:flex md:flex-col md:flex-shrink-0 md:min-w-[28rem]">
            <ChatCard
              messages={messages}
              isLoading={isLoading}
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
