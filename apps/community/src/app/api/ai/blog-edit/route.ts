import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type BlogEditRequestBody = {
  text?: string;
  instruction?: string;
  scope?: "section" | "post";
};

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not available" }, { status: 500 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: BlogEditRequestBody;
  try {
    body = (await request.json()) as BlogEditRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const instruction = typeof body.instruction === "string" ? body.instruction.trim() : "";
  const scope = body.scope === "post" || body.scope === "section" ? body.scope : "section";

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (!instruction) {
    return NextResponse.json({ error: "Instruction is required" }, { status: 400 });
  }

  if (text.length > 8000) {
    return NextResponse.json({ error: "Text is too long for editing" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI editing is not configured yet. Missing OPENAI_API_KEY." },
      { status: 500 }
    );
  }

  const systemPrompt =
    "You are an assistant that helps edit technical blog posts. " +
    "You will receive a section or a full post as plain text along with an editing instruction. " +
    "Return only the edited text, without any explanations, markup, or commentary. " +
    "Preserve markdown-like line breaks and paragraphs. Do not add introductions or conclusions.";

  const userPrompt = [
    `Scope: ${scope === "post" ? "Full post" : "Single section"}`,
    "",
    `Instruction: ${instruction}`,
    "",
    "Original text:",
    text
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "AI editing request failed", details: errorText.slice(0, 500) },
      { status: 500 }
    );
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };

  const editedText =
    json.choices?.[0]?.message?.content?.trim() && typeof json.choices[0].message.content === "string"
      ? json.choices[0].message.content.trim()
      : "";

  if (!editedText) {
    return NextResponse.json(
      { error: "AI response did not contain edited text" },
      { status: 500 }
    );
  }

  return NextResponse.json({ editedText });
}

