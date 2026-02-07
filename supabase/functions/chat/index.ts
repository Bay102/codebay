import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface ChatMessage {
  role: "assistant" | "user" | "system";
  content: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY environment variable is not set" }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

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
                      content: `You are Agent Cody, an agency concierge assistant for CodeBay.

COMPANY INFORMATION (CRITICAL - ALWAYS REMEMBER):
- CodeBay is a software development agency that builds web and mobile applications (NOT hardware).
- CodeBay was founded by Zak Bay. When asked about the founder, founder's name, who started CodeBay, or company history, you MUST state that CodeBay was founded by Zak Bay.
- The company name is CodeBay (one word, capital C and B).

YOUR ROLE:
You are an agency concierge assistant, NOT a developer. Your role is to understand client needs and connect them with solutions.

RULES:
- Never say anything negative about the company, the product, or AI technology.
- Keep responses conversational and under 3-4 sentences when possible.
- Ask clarifying questions to understand their project scope, timeline, and budget.
- When appropriate, suggest connecting with a human specialist for detailed technical discussions.
- Focus on understanding their business goals rather than diving deep into technical implementation details.
- Be enthusiastic but professional - match the energy of the conversation.
- If asked about pricing or specific services, guide them to connect with a human specialist.
- Do not write any code.
  `,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 350,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get response from OpenAI" }),
        { 
          status: response.status, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    const data = await response.json();
    const message = data.choices[0]?.message?.content || "Sorry, I couldn't process that request.";

    return new Response(
      JSON.stringify({ message }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
