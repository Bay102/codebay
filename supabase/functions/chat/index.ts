import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface ChatMessage {
  role: "assistant" | "user" | "system";
  content: string;
}

type ClientRateLimitState = {
  shortWindowStart: number;
  shortCount: number;
  longWindowStart: number;
  longCount: number;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CHAT_SHORT_WINDOW_MS = 20_000;
const CHAT_SHORT_WINDOW_MAX = 4;
const CHAT_LONG_WINDOW_MS = 5 * 60_000;
const CHAT_LONG_WINDOW_MAX = 20;
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 500;

const rateLimitStore = new Map<string, ClientRateLimitState>();

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
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

  if (now - state.shortWindowStart >= CHAT_SHORT_WINDOW_MS) {
    state.shortWindowStart = now;
    state.shortCount = 0;
  }

  if (now - state.longWindowStart >= CHAT_LONG_WINDOW_MS) {
    state.longWindowStart = now;
    state.longCount = 0;
  }

  if (state.shortCount >= CHAT_SHORT_WINDOW_MAX) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((CHAT_SHORT_WINDOW_MS - (now - state.shortWindowStart)) / 1000),
      ),
    };
  }

  if (state.longCount >= CHAT_LONG_WINDOW_MAX) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((CHAT_LONG_WINDOW_MS - (now - state.longWindowStart)) / 1000),
      ),
    };
  }

  state.shortCount += 1;
  state.longCount += 1;
  rateLimitStore.set(clientKey, state);
  return { limited: false, retryAfterSeconds: 0 };
};

const isClientMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    (record.role === "assistant" || record.role === "user") &&
    typeof record.content === "string" &&
    record.content.trim().length > 0 &&
    record.content.length <= MAX_CONTENT_LENGTH
  );
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the request has proper authorization from Supabase client
    const authHeader = req.headers.get("Authorization");
    const apikeyHeader = req.headers.get("apikey");
    
    // Edge Functions require either Authorization Bearer token or apikey header
    // The Supabase client should send this automatically with the anon key
    if (!authHeader && !apikeyHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authentication headers" }),
        { 
          status: 401, 
          headers: jsonHeaders 
        }
      );
    }

    const clientKey = getClientIdentifier(req);
    const rateLimit = checkRateLimit(clientKey);
    if (rateLimit.limited) {
      return new Response(
        JSON.stringify({ error: "Too many chat requests. Please slow down and try again shortly." }),
        {
          status: 429,
          headers: {
            ...jsonHeaders,
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY environment variable is not set" }),
        { 
          status: 500, 
          headers: jsonHeaders 
        }
      );
    }

    const body = (await req.json().catch(() => null)) as { messages?: unknown } | null;
    const messages = body?.messages;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { 
          status: 400, 
          headers: jsonHeaders 
        }
      );
    }

    if (messages.length === 0 || messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: `Messages must contain between 1 and ${MAX_MESSAGES} entries` }),
        {
          status: 400,
          headers: jsonHeaders,
        },
      );
    }

    if (!messages.every(isClientMessage)) {
      return new Response(
        JSON.stringify({ error: "Invalid message payload" }),
        {
          status: 400,
          headers: jsonHeaders,
        },
      );
    }

    const sanitizedMessages = messages.map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));

    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
                      content: `You are Agent Anton, an agency concierge assistant for CodeBay.

COMPANY INFORMATION (CRITICAL - ALWAYS REMEMBER):
- CodeBay is a software development agency that builds web and mobile applications (NOT hardware).
- CodeBay was founded by Zak Bay. When asked about the founder, founder's name, who started CodeBay, or company history, you MUST state that CodeBay was founded by Zak Bay.
- The company name is CodeBay (one word, capital C and B).

YOUR ROLE:
You are an agency concierge assistant, NOT a developer. Your role is to understand the basic client needs and connect them with CodeBay for software development services.

RULES:
- Never say anything negative about the company, the product, or AI technology.
- Keep responses conversational and at 2-3 sentences.
- Ask clarifying questions to understand their project scope, timeline, and budget.
- When appropriate, suggest connecting with a human specialist for detailed technical discussions.
- Focus on understanding their business goals rather than diving deep into technical implementation details.
- Be enthusiastic but professional - match the energy of the conversation.
- If asked about pricing or specific services, guide them to connect with a human specialist.
- If asked about connecting with a human specialist, provide instructions to click the "Connect with CodeBay" button in the chat interface.
- Do NOT write any code.
  `,
          },
          ...sanitizedMessages,
        ],
        temperature: 0.7,
        max_tokens: 125,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get response from OpenAI" }),
        { 
          status: response.status, 
          headers: jsonHeaders 
        }
      );
    }

    const data = await response.json();
    const message = data.choices[0]?.message?.content || "Sorry, I couldn't process that request.";

    return new Response(
      JSON.stringify({ message }),
      { 
        headers: jsonHeaders 
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: jsonHeaders 
      }
    );
  }
});
