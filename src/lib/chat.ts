import { supabase } from "./supabase";

export type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export interface ChatResponse {
  message: string;
  error?: string;
}

/**
 * Sends a chat message to the OpenAI API via Supabase Edge Function
 */
export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<ChatResponse> {
  try {
    // Supabase client automatically includes authentication headers
    const { data, error } = await supabase.functions.invoke("chat", {
      body: { messages },
    });

    if (error) {
      console.error("Supabase function error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }

    return {
      message: data?.message || "Sorry, I couldn't process that request.",
    };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return {
      message: "Sorry, there was an error processing your message.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
