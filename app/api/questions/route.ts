import { NextRequest, NextResponse } from "next/server";

import type {
  FinderConcern,
  GeneratedQuestionsResult,
  ResourceExperience,
  ResourceSlug,
  StudentYear,
  WalkthroughMode,
} from "@/lib/types";

type QuestionsRequestBody = {
  situation?: unknown;
  resourceType?: unknown;
  appointmentType?: unknown;
  concern?: unknown;
  year?: unknown;
  experience?: unknown;
};

type IncomingMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const VALID_RESOURCES = new Set<ResourceSlug>([
  "tutoring",
  "advising",
  "counseling",
  "financial-aid",
  "scholarship-search",
  "career-services",
  "student-success-center",
]);

const VALID_MODES = new Set<WalkthroughMode>(["in-person", "online", "drop-in"]);
const VALID_CONCERNS = new Set<FinderConcern>([
  "class",
  "money",
  "overwhelmed",
  "schedule",
  "something-else",
]);
const VALID_YEARS = new Set<StudentYear>([
  "first-year",
  "second-year",
  "third-year",
  "fourth-year-plus",
]);
const VALID_EXPERIENCE = new Set<ResourceExperience>(["yes", "no", "not-sure"]);

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

function stripJsonFences(input: string): string {
  return input.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

function parseQuestionsResult(input: string): GeneratedQuestionsResult | null {
  try {
    const parsed = JSON.parse(stripJsonFences(input)) as {
      opener?: unknown;
      questions?: unknown;
      proTip?: unknown;
    };

    if (
      typeof parsed.opener !== "string" ||
      !Array.isArray(parsed.questions) ||
      typeof parsed.proTip !== "string"
    ) {
      return null;
    }

    const questions = parsed.questions
      .filter((question): question is string => typeof question === "string")
      .map((question) => question.trim())
      .filter(Boolean)
      .slice(0, 7);

    if (questions.length < 5) {
      return null;
    }

    return {
      opener: parsed.opener.trim(),
      questions,
      proTip: parsed.proTip.trim(),
    };
  } catch {
    return null;
  }
}

function normalizeBody(input: QuestionsRequestBody) {
  const situation = typeof input.situation === "string" ? input.situation.trim() : "";
  const resourceType =
    typeof input.resourceType === "string" && VALID_RESOURCES.has(input.resourceType as ResourceSlug)
      ? (input.resourceType as ResourceSlug)
      : null;
  const appointmentType =
    typeof input.appointmentType === "string" &&
    VALID_MODES.has(input.appointmentType as WalkthroughMode)
      ? (input.appointmentType as WalkthroughMode)
      : null;
  const concern =
    typeof input.concern === "string" && VALID_CONCERNS.has(input.concern as FinderConcern)
      ? (input.concern as FinderConcern)
      : null;
  const year =
    typeof input.year === "string" && VALID_YEARS.has(input.year as StudentYear)
      ? (input.year as StudentYear)
      : null;
  const experience =
    typeof input.experience === "string" &&
    VALID_EXPERIENCE.has(input.experience as ResourceExperience)
      ? (input.experience as ResourceExperience)
      : null;

  return {
    situation,
    resourceType,
    appointmentType,
    concern,
    year,
    experience,
  };
}

export async function POST(request: NextRequest) {
  const body = normalizeBody((await request.json()) as QuestionsRequestBody);
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  if (!body.situation) {
    return NextResponse.json(
      {
        error: "Add a short situation description first, then generate the personalized questions.",
      },
      { status: 400 },
    );
  }

  if (!body.resourceType || !body.appointmentType) {
    return NextResponse.json(
      {
        error: "The walkthrough context was incomplete. Reload the page and try again.",
      },
      { status: 400 },
    );
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Personalized questions need OPENROUTER_API_KEY before they can be generated. The default questions still work.",
      },
      { status: 500 },
    );
  }

  const yearLabel = body.year ?? "college";
  const concernLabel = body.concern ?? "something else";
  const experienceLine =
    body.experience === "no"
      ? "They have never used campus resources before."
      : body.experience === "yes"
        ? "They have used some campus resources before."
        : "They are not sure whether they have used campus resources before.";

  const systemPrompt = `You are a coach helping a ${yearLabel} college student prepare for their ${body.resourceType} ${body.appointmentType} at Arizona State University.

The student selected "${concernLabel}" as their main concern.
${experienceLine}
They described their situation as: "${body.situation}"

Generate 5-7 specific questions this student should ask. The questions should:
- Be directly relevant to their concern and year
- Use simple language
- Be specific enough to read directly from their phone
- Include one question they probably would not think to ask
${body.experience === "no" ? "- Include one question that helps them understand how the resource works, since this is new to them" : ""}

Return raw JSON only with this shape:
{
  "opener": "what to say when you walk in or join the call",
  "questions": ["...", "..."],
  "proTip": "one practical tip for this situation"
}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://sundevilconnect.local",
        "X-Title": "SunDevilConnect Questions",
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          } satisfies IncomingMessage,
          {
            role: "user",
            content: "Generate the JSON now.",
          } satisfies IncomingMessage,
        ],
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
            "The question generator did not complete the request. Use the default questions for now.",
        },
        { status: response.status },
      );
    }

    const reply = extractReply(data.choices?.[0]?.message?.content);
    const result = parseQuestionsResult(reply);

    if (!result) {
      return NextResponse.json(
        {
          error:
            "The question generator responded without valid JSON. Use the default questions for now.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error:
          "The question generator is temporarily unavailable. You can still use the default questions below.",
      },
      { status: 500 },
    );
  }
}
