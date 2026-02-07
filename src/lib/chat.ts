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
    // Get the anon key to ensure it's available
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!anonKey) {
      throw new Error("Supabase anon key is not configured");
    }

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
