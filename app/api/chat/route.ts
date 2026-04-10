import { NextRequest, NextResponse } from "next/server";

import resources from "@/data/asu_resources.json";
import { getAppOrigin } from "@/lib/app-origin";

type IncomingMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

function normalizeMessages(input: unknown): IncomingMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((item): item is IncomingMessage => {
      return (
        typeof item === "object" &&
        item !== null &&
        "role" in item &&
        "content" in item &&
        typeof item.role === "string" &&
        typeof item.content === "string" &&
        ["user", "assistant"].includes(item.role)
      );
    })
    .slice(-12);
}

function extractReply(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (
          typeof part === "object" &&
          part !== null &&
          "type" in part &&
          part.type === "text" &&
          "text" in part &&
          typeof part.text === "string"
        ) {
          return part.text;
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

export async function POST(request: NextRequest) {
  const { messages } = (await request.json()) as { messages?: unknown };
  const normalizedMessages = normalizeMessages(messages);
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const appOrigin = getAppOrigin();

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      {
        error:
          "SunDevil Guide needs OPENROUTER_API_KEY before chat can work. Add the key and try again.",
      },
      { status: 500 },
    );
  }

  const systemPrompt = `You are SunDevil Guide, a friendly, non-judgmental assistant for first-generation college students at Arizona State University.

You help students find and understand campus resources. Be warm, casual, clear, and specific. Never make them feel dumb for asking.

Here are ASU resources you know about:
${JSON.stringify(resources)}

When recommending a resource:
- explain what it is in plain language
- tell them exactly what will happen when they go
- give them the specific steps to sign up
- normalize their situation ("lots of students use this")

Keep responses short. Two or three paragraphs max.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": appOrigin,
        "X-Title": "SunDevilConnect",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...normalizedMessages],
      }),
    });

    const data = (await response.json()) as {
      error?: { message?: string };
      choices?: Array<{ message?: { content?: unknown } }>;
    };

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error?.message ??
            "OpenRouter did not complete the request. Please try again in a moment.",
        },
        { status: response.status },
      );
    }

    const reply = extractReply(data.choices?.[0]?.message?.content);

    if (!reply) {
      return NextResponse.json(
        {
          error: "The chat service responded without usable text. Please try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      {
        error:
          "The chat service is temporarily unavailable. The rest of SunDevilConnect still works while that is fixed.",
      },
      { status: 500 },
    );
  }
}
