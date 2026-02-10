import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type ConnectHumanPayload = {
  name: string;
  email: string;
  phone?: string | null;
  notes?: string | null;
  messages: ChatMessage[];
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// E.164 format: + followed by 7-15 digits (optional spaces/dashes/dots/parens)
const phoneRegex = /^\+?[\d\s().-]{7,25}$/;

const isValidEmail = (value: string) => emailRegex.test(value);
const isValidPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && phoneRegex.test(value);
};

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  const role = record.role;
  return (role === "assistant" || role === "user") && isNonEmptyString(record.content);
};

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const apikeyHeader = req.headers.get("apikey");

    if (!authHeader && !apikeyHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authentication headers" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!supabaseAdmin) {
      return new Response(
        JSON.stringify({ error: "Supabase service role is not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const body = (await req.json().catch(() => null)) as ConnectHumanPayload | null;

    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const { name, email, phone, notes, messages } = body;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim() : "";
    const normalizedPhone =
      phone == null || phone === "" ? "" : typeof phone === "string" ? phone.trim() : "";
    const normalizedNotes = typeof notes === "string" ? notes.trim() : "";

    if (!isNonEmptyString(normalizedName) || !isNonEmptyString(normalizedEmail)) {
      return new Response(JSON.stringify({ error: "Name and email are required" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    if (normalizedPhone.length > 0 && !isValidPhone(normalizedPhone)) {
      return new Response(JSON.stringify({ error: "Invalid phone format" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    if (!Array.isArray(messages) || !messages.every(isChatMessage)) {
      return new Response(JSON.stringify({ error: "Messages must be a valid array" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const { error } = await supabaseAdmin.from("chat_handoffs").insert({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone.length > 0 ? normalizedPhone : null,
      notes: normalizedNotes.length > 0 ? normalizedNotes : null,
      chat_history: messages,
    });

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to store handoff request" }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
