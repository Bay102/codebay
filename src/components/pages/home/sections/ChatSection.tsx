import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestHumanConnect, sendChatMessage, type ChatMessage } from "@/lib/chat";
import { ChatCard } from "@/components/pages/home/sections/Anton/ChatCard";
import { ChatSectionCopy } from "@/components/pages/home/sections/Anton/ChatSectionCopy";
import { chatFormSchema, humanConnectFormSchema, type ChatFormValues, type ConnectStatus, type HumanConnectFormValues } from "@/components/pages/home/sections/Anton/chatForms";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hey! I'm Anton. Most people land here because they need help with tech—a mobile app, web app, or custom software. What brings you here?",
  },
];

const CHAT_MIN_INTERVAL_MS = 2500;
const CONNECT_MIN_INTERVAL_MS = 30_000;
const CONNECT_MIN_FILL_MS = 2000;
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
          <div className="order-2 mb-4 w-full md:mb-0 md:flex md:min-w-[28rem] md:w-auto md:flex-shrink-0 md:flex-col">
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
