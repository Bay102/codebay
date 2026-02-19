import { supabase } from "../supabase";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeRecordId = (rawId: string) => rawId.trim().replace(/^eq\./i, "");

export type ChatHandoffRecord = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  chat_history: unknown;
  notes: string | null;
  archived: boolean | null;
};

export type GetChatHandoffsResult = {
  data: ChatHandoffRecord[];
  error: string | null;
};

export type UpdateChatHandoffArchivedResult = {
  success: boolean;
  error: string | null;
  data: Pick<ChatHandoffRecord, "id" | "archived"> | null;
};

export async function getChatHandoffs(): Promise<GetChatHandoffsResult> {
  const { data, error } = await supabase
    .from("chat_handoffs")
    .select("id, created_at, name, email, phone, chat_history, notes, archived")
    .order("created_at", { ascending: false })
    .returns<ChatHandoffRecord[]>();

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

  const { data, error } = await supabase
    .from("chat_handoffs")
    .update({ archived })
    .eq("id", normalizedId)
    .select("id, archived")
    .returns<Array<Pick<ChatHandoffRecord, "id" | "archived">>>();

  if (error) {
    console.error("Failed to update chat handoff archived status:", error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }

  const updatedRow = Array.isArray(data) ? data[0] ?? null : null;

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
