const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const truncate = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

export const formatTimestamp = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
};

export const formatTextCell = (value: string | null) => {
  if (!value || value.trim().length === 0) {
    return "—";
  }

  return value;
};

export const serializeChatHistory = (chatHistory: unknown) => {
  if (chatHistory == null) {
    return "null";
  }

  try {
    return JSON.stringify(chatHistory);
  } catch {
    return "[unserializable json]";
  }
};

export const getChatHistoryMessageCount = (chatHistory: unknown) =>
  Array.isArray(chatHistory) ? chatHistory.length : 0;

export type ChatHistoryMessage = {
  role: string;
  content: string;
};

export const parseChatHistoryMessages = (chatHistory: unknown): ChatHistoryMessage[] => {
  if (!Array.isArray(chatHistory)) {
    return [];
  }

  return chatHistory
    .map((message) => {
      if (!message || typeof message !== "object") {
        return null;
      }

      const candidate = message as Record<string, unknown>;
      if (typeof candidate.role !== "string" || typeof candidate.content !== "string") {
        return null;
      }

      return {
        role: candidate.role,
        content: candidate.content,
      };
    })
    .filter((message): message is ChatHistoryMessage => message !== null);
};

export const getChatHistoryPreviewText = (chatHistory: unknown) => {
  const messages = parseChatHistoryMessages(chatHistory);
  const firstUserMessage = messages.find((message) => message.role.toLowerCase() === "user");

  if (firstUserMessage?.content) {
    return truncate(firstUserMessage.content, 150);
  }

  return truncate(serializeChatHistory(chatHistory), 150);
};
