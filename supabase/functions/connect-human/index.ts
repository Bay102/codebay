import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Database, TablesInsert } from "../../supa-schema.ts";

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
  antiBot?: {
    formFillMs?: number;
  };
};

type ClientRateLimitState = {
  shortWindowStart: number;
  shortCount: number;
  longWindowStart: number;
  longCount: number;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CONNECT_SHORT_WINDOW_MS = 30_000;
const CONNECT_SHORT_WINDOW_MAX = 1;
const CONNECT_LONG_WINDOW_MS = 60 * 60_000;
const CONNECT_LONG_WINDOW_MAX = 5;
const MIN_FORM_FILL_MS = 1500;
const MAX_CHAT_MESSAGES = 25;
const MAX_CHAT_MESSAGE_LENGTH = 500;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 30;
const MAX_NOTES_LENGTH = 2000;

const rateLimitStore = new Map<string, ClientRateLimitState>();

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
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
  return (
    (role === "assistant" || role === "user") &&
    isNonEmptyString(record.content) &&
    String(record.content).length <= MAX_CHAT_MESSAGE_LENGTH
  );
};

const getClientIdentifier = (req: Request) => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  const authHeader = req.headers.get("Authorization");
  const apikeyHeader = req.headers.get("apikey");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || cfConnectingIp || "unknown-ip";
  const authSuffix = authHeader?.slice(-12) || apikeyHeader?.slice(-12) || "anonymous";
  return `${ip}:${authSuffix}`;
};

const checkRateLimit = (clientKey: string) => {
  const now = Date.now();
  const existing = rateLimitStore.get(clientKey);
  const state: ClientRateLimitState = existing ?? {
    shortWindowStart: now,
    shortCount: 0,
    longWindowStart: now,
    longCount: 0,
  };

  if (now - state.shortWindowStart >= CONNECT_SHORT_WINDOW_MS) {
    state.shortWindowStart = now;
    state.shortCount = 0;
  }

  if (now - state.longWindowStart >= CONNECT_LONG_WINDOW_MS) {
    state.longWindowStart = now;
    state.longCount = 0;
  }

  if (state.shortCount >= CONNECT_SHORT_WINDOW_MAX) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((CONNECT_SHORT_WINDOW_MS - (now - state.shortWindowStart)) / 1000),
      ),
    };
  }

  if (state.longCount >= CONNECT_LONG_WINDOW_MAX) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((CONNECT_LONG_WINDOW_MS - (now - state.longWindowStart)) / 1000),
      ),
    };
  }

  state.shortCount += 1;
  state.longCount += 1;
  rateLimitStore.set(clientKey, state);
  return { limited: false, retryAfterSeconds: 0 };
};

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
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
          headers: jsonHeaders,
        },
      );
    }

    const clientKey = getClientIdentifier(req);
    const rateLimit = checkRateLimit(clientKey);
    if (rateLimit.limited) {
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again shortly." }),
        {
          status: 429,
          headers: {
            ...jsonHeaders,
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    if (!supabaseAdmin) {
      return new Response(
        JSON.stringify({ error: "Supabase service role is not configured" }),
        {
          status: 500,
          headers: jsonHeaders,
        },
      );
    }

    const body = (await req.json().catch(() => null)) as ConnectHumanPayload | null;

    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const { name, email, phone, notes, messages, antiBot } = body;
    const normalizedName = typeof name === "string" ? name.trim().slice(0, MAX_NAME_LENGTH) : "";
    const normalizedEmail =
      typeof email === "string" ? email.trim().slice(0, MAX_EMAIL_LENGTH) : "";
    const normalizedPhone =
      phone == null || phone === ""
        ? ""
        : typeof phone === "string"
          ? phone.trim().slice(0, MAX_PHONE_LENGTH)
          : "";
    const normalizedNotes =
      typeof notes === "string" ? notes.trim().slice(0, MAX_NOTES_LENGTH) : "";
    const formFillMs = antiBot?.formFillMs;

    if (typeof formFillMs === "number" && Number.isFinite(formFillMs) && formFillMs < MIN_FORM_FILL_MS) {
      return new Response(JSON.stringify({ error: "Submission failed validation" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    if (!isNonEmptyString(normalizedName) || !isNonEmptyString(normalizedEmail)) {
      return new Response(JSON.stringify({ error: "Name and email are required" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    if (normalizedPhone.length > 0 && !isValidPhone(normalizedPhone)) {
      return new Response(JSON.stringify({ error: "Invalid phone format" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    if (!Array.isArray(messages) || !messages.every(isChatMessage)) {
      return new Response(JSON.stringify({ error: "Messages must be a valid array" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    if (messages.length > MAX_CHAT_MESSAGES) {
      return new Response(
        JSON.stringify({ error: `Messages must be ${MAX_CHAT_MESSAGES} or fewer` }),
        {
          status: 400,
          headers: jsonHeaders,
        },
      );
    }

    if (normalizedNotes.length > MAX_NOTES_LENGTH) {
      return new Response(JSON.stringify({ error: "Notes are too long" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const handoffInsert: TablesInsert<"chat_handoffs"> = {
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone.length > 0 ? normalizedPhone : null,
      notes: normalizedNotes.length > 0 ? normalizedNotes : null,
      chat_history: messages
    };

    const { error } = await supabaseAdmin.from("chat_handoffs").insert(handoffInsert);

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to store handoff request" }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: jsonHeaders,
      },
    );
  }
});
