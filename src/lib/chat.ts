import { supabase } from "./supabase";

export type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export type HumanConnectPayload = {
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  messages: ChatMessage[];
};

export interface ChatResponse {
  message: string;
  error?: string;
}

export interface HumanConnectResponse {
  success: boolean;
  error?: string;
}

const hasErrorMessage = (value: unknown): value is { error: string } =>
  typeof value === "object" &&
  value !== null &&
  "error" in value &&
  typeof (value as { error?: unknown }).error === "string";

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

/**
 * Sends a human connect request with chat history.
 */
export async function requestHumanConnect(
  payload: HumanConnectPayload
): Promise<HumanConnectResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("connect-human", {
      body: payload,
    });

    if (error) {
      console.error("Supabase function error:", error);
      // Extract error message from response body (error.context is the Response)
      let errorMessage = error.message;
      try {
        const res = (error as { context?: Response }).context;
        if (res && typeof res.json === "function") {
          const body = (await res.json()) as { error?: string };
          if (body?.error) errorMessage = body.error;
        }
      } catch {
        // Fall back to error.message
      }
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (hasErrorMessage(data)) {
      return {
        success: false,
        error: data.error,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error requesting human connect:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
