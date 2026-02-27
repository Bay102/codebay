import { supabase } from "../../src/lib/supabase";
import type { Tables, TablesUpdate } from "../supa-schema";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeRecordId = (rawId: string) => rawId.trim().replace(/^eq\./i, "");

export type ChatHandoffRecord = Tables<"chat_handoffs">;
type ChatHandoffArchivedUpdate = Pick<Tables<"chat_handoffs">, "id" | "archived">;

export type GetChatHandoffsResult = {
  data: ChatHandoffRecord[];
  error: string | null;
};

export type UpdateChatHandoffArchivedResult = {
  success: boolean;
  error: string | null;
  data: ChatHandoffArchivedUpdate | null;
};

export async function getChatHandoffs(): Promise<GetChatHandoffsResult> {
  const { data, error } = await supabase
    .from("chat_handoffs")
    .select("id, created_at, name, email, phone, chat_history, notes, archived")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch chat handoffs:", error);
    return {
      data: [],
      error: error.message,
    };
  }

  return {
    data: data ?? [],
    error: null,
  };
}

export async function updateChatHandoffArchived(
  id: string,
  archived: boolean
): Promise<UpdateChatHandoffArchivedResult> {
  const normalizedId = normalizeRecordId(id);
  if (!UUID_REGEX.test(normalizedId)) {
    return {
      success: false,
      error: `Invalid chat handoff id: "${id}"`,
      data: null,
    };
  }

  const payload: TablesUpdate<"chat_handoffs"> = { archived };
  const { data, error } = await supabase
    .from("chat_handoffs")
    .update(payload)
    .eq("id", normalizedId)
    .select("id, archived");

  if (error) {
    console.error("Failed to update chat handoff archived status:", error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }

  const updatedRow = (Array.isArray(data) ? data[0] ?? null : null) as ChatHandoffArchivedUpdate | null;

  if (!updatedRow) {
    return {
      success: false,
      error:
        "No row was updated. Verify the record exists and your Supabase RLS update policy allows this action.",
      data: null,
    };
  }

  return {
    success: true,
    error: null,
    data: updatedRow,
  };
}
