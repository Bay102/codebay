import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2 } from "lucide-react";
import { sendChatMessage, type ChatMessage } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const chatFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "Hi, I am CodeBay AI. Tell me about your product goals and timeline."
  },
  {
    role: "user",
    content: "We need a modern SaaS app with AI search, analytics, and a fast launch."
  },
  {
    role: "assistant",
    content: "Perfect. I can map scope, stack, and milestones in minutes. Web-first or mobile-first?"
  }
];

const HomeSection = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      message: "",
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = async (values: ChatFormValues) => {
    const userMessage: ChatMessage = {
      role: "user",
      content: values.message,
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    form.reset();
    setIsLoading(true);

    try {
      // Get all messages including the new user message
      const updatedMessages = [...messages, userMessage];
      const response = await sendChatMessage(updatedMessages);

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, there was an error processing your message. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full flex items-start sm:items-center justify-center pt-0 pb-16 sm:pb-24 md:pb-28 lg:pb-32 xl:pb-40 -mt-6 sm:mt-0">
      <div className="video-placeholder w-full h-full flex items-center justify-center">
        <div className="relative w-[100vw] sm:w-full max-w-[520px] sm:max-w-[580px] md:max-w-[660px] lg:max-w-[740px] xl:max-w-[800px] aspect-square rounded-full animate-float">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl animate-pulse-glow" />
          <div className="absolute inset-[6%] rounded-full border border-white/10" />
          <div className="absolute inset-[12%] rounded-full border border-primary/20 animate-[spin_18s_linear_infinite]" />
          <div className="absolute -left-8 top-12 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-10 bottom-10 h-28 w-28 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute left-[15%] bottom-[18%] h-3 w-3 rounded-full bg-primary/70 shadow-[0_0_16px_rgba(249,115,22,0.8)]" />
          <div className="absolute right-[20%] top-[16%] h-2 w-2 rounded-full bg-accent/70 shadow-[0_0_12px_rgba(244,63,94,0.8)]" />

          <div className="flex items-center justify-center absolute inset-[1%] sm:inset-[8%] md:inset-[16%] lg:inset-[18%]">
            <div className="glass-nav relative w-full rounded-3xl p-2 -mt-32 md:p-3 shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:-mt-0">
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                <div
                  className="absolute inset-0 rounded-2xl opacity-80"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1), transparent 45%), radial-gradient(circle at 80% 30%, rgba(249,115,22,0.18), transparent 55%), radial-gradient(circle at 40% 85%, rgba(244,63,94,0.12), transparent 50%)"
                  }}
                  aria-hidden="true"
                />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      <div>
                        <p className="text-xs font-medium text-foreground">CodeBay AI</p>
                        <p className="text-[10px] text-muted-foreground">Agency concierge</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Preview
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 space-y-3 px-4 py-3 overflow-y-auto">
                    {messages.map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-[10px] sm:text-[11px] leading-relaxed ${message.role === "assistant"
                          ? "bg-white/5 text-foreground border border-white/10"
                          : "ml-auto bg-primary/20 text-foreground border border-primary/30"
                          }`}
                      >
                        {message.content}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="max-w-[85%] rounded-2xl px-3 py-2 text-[10px] sm:text-[11px] leading-relaxed bg-white/5 text-foreground border border-white/10">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="px-4 pb-4">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-background/40 px-3 py-2">
                      <Input
                        {...form.register("message")}
                        placeholder="Ask about your product, timeline, or tech stack..."
                        className="w-full bg-transparent border-0 text-[10px] sm:text-[11px] text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={isLoading}
                        autoComplete="off"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !form.watch("message")?.trim()}
                        className="flex h-6 min-w-[44px] items-center justify-center rounded-full bg-primary/20 px-3 text-[10px] font-medium text-primary-foreground/90 hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        size="sm"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                      </Button>
                    </form>

                    {/* <div className="mt-3 flex flex-wrap gap-2">
                      {trainingFocus.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-wider text-muted-foreground"
                        >
                          {topic}
                        </span>
                      ))}
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;
