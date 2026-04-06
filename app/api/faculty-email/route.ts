import { NextRequest, NextResponse } from "next/server";

import {
  getBadgeMeta,
  getContextTags,
  getDashboardStudent,
  getResourceSummarySentence,
  getSimulationLabel,
  getSimulationSupportLink,
} from "@/lib/dashboard";
import { getResourceBySlug } from "@/lib/data";
import type {
  FacultyEmailDraft,
  FacultyEmailFocusArea,
  FacultyEmailTone,
  ResourceSlug,
} from "@/lib/types";

type FacultyEmailRequestBody = {
  studentId?: unknown;
  professorName?: unknown;
  courseName?: unknown;
  campus?: unknown;
  tone?: unknown;
  focusArea?: unknown;
  includeSimLink?: unknown;
  includeResourceType?: unknown;
};

type IncomingMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const VALID_TONES = new Set<FacultyEmailTone>(["warm", "direct", "encouraging"]);
const VALID_FOCUS = new Set<FacultyEmailFocusArea>([
  "navigation",
  "tutoring",
  "advising",
  "general",
]);
const VALID_RESOURCES = new Set<ResourceSlug>([
  "tutoring",
  "advising",
  "counseling",
  "financial-aid",
  "scholarship-search",
  "career-services",
  "student-success-center",
]);

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

function parseDraft(input: string): FacultyEmailDraft | null {
  try {
    const parsed = JSON.parse(stripJsonFences(input)) as {
      subject?: unknown;
      body?: unknown;
    };

    if (typeof parsed.subject !== "string" || typeof parsed.body !== "string") {
      return null;
    }

    const subject = parsed.subject.trim();
    const body = parsed.body.trim();
    if (!subject || !body) {
      return null;
    }

    if (/\bfirst[- ]gen\b|\bfirst[- ]generation\b/i.test(body)) {
      return null;
    }

    return {
      subject,
      body,
    };
  } catch {
    return null;
  }
}

function normalizeBody(input: FacultyEmailRequestBody) {
  return {
    studentId: typeof input.studentId === "string" ? input.studentId : null,
    professorName: typeof input.professorName === "string" ? input.professorName.trim() : "",
    courseName: typeof input.courseName === "string" ? input.courseName.trim() : "",
    campus: typeof input.campus === "string" ? input.campus.trim() : "",
    tone:
      typeof input.tone === "string" && VALID_TONES.has(input.tone as FacultyEmailTone)
        ? (input.tone as FacultyEmailTone)
        : null,
    focusArea:
      typeof input.focusArea === "string" && VALID_FOCUS.has(input.focusArea as FacultyEmailFocusArea)
        ? (input.focusArea as FacultyEmailFocusArea)
        : null,
    includeSimLink: Boolean(input.includeSimLink),
    includeResourceType:
      typeof input.includeResourceType === "string" &&
      VALID_RESOURCES.has(input.includeResourceType as ResourceSlug)
        ? (input.includeResourceType as ResourceSlug)
        : null,
  };
}

export async function POST(request: NextRequest) {
  const body = normalizeBody((await request.json()) as FacultyEmailRequestBody);
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  if (!body.studentId || !body.professorName || !body.courseName || !body.campus || !body.tone || !body.focusArea) {
    return NextResponse.json(
      {
        error: "The faculty email request was incomplete. Refresh the page and try again.",
      },
      { status: 400 },
    );
  }

  const student = getDashboardStudent(body.studentId);
  if (!student) {
    return NextResponse.json(
      {
        error: "The selected student could not be found in the faculty roster.",
      },
      { status: 404 },
    );
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI email drafts need OPENROUTER_API_KEY before they can be generated. The dashboard still works without it.",
      },
      { status: 500 },
    );
  }

  const resource = body.includeResourceType ? getResourceBySlug(body.includeResourceType) : null;
  const simulationLink = body.includeSimLink ? getSimulationSupportLink(student) : null;
  const badgeMeta = getBadgeMeta(student.simulation.badges);
  const badgeText = badgeMeta.length
    ? badgeMeta.map((badge) => badge.title).join(", ")
    : "No badges earned yet";

  const systemPrompt = `You are writing an email from a university professor to a student in their class. The email should feel warm, specific, and non-threatening. It should never sound like a mass email or a warning.

PROFESSOR INFO:
- Name: ${body.professorName}
- Course: ${body.courseName}
- Campus: ${body.campus}

STUDENT CONTEXT:
- First name: ${student.firstName}
- Pronouns: ${student.pronouns}
- Year: ${student.year}
- Major: ${student.major}
- First-generation student: ${student.isFirstGen ? "Yes" : "No"}
- Context tags: ${getContextTags(student).join(", ")}
- Observed strengths: ${student.strengths.join(", ")}
- Recent signals: ${student.signals
    .slice(0, 3)
    .map((signal) => `${signal.date}: ${signal.description}`)
    .join("; ")}
- Resource usage summary: ${getResourceSummarySentence(student)}
- Simulation progress: ${getSimulationLabel(student.simulation)} with badges ${badgeText}
- Support focus: ${student.supportFocus}

PROFESSOR SETTINGS:
- Tone: ${body.tone}
- Focus area: ${body.focusArea}
- Include simulation link: ${body.includeSimLink ? "Yes" : "No"}

${simulationLink ? `SIMULATION SUPPORT LINK:\n- Label: ${simulationLink.label}\n- Path: ${simulationLink.href}\n` : ""}
${resource ? `RESOURCE DETAILS:\n- Name: ${resource.name}\n- Location: ${resource.location}\n- Hours: ${resource.hours}\n- What to expect: ${resource.signUpSummary}\n- URL: ${resource.url}\n` : ""}

RULES:
- Use the student's first name
- Reference a real strength, not a weakness
- Normalize the situation with language like "a lot of students..."
- If including a resource, use the exact location, hours, and what-to-expect details above
- Keep the body under 150 words
- Do not use the phrases "I noticed you haven't been using resources" or any surveillance wording
- End in a low-pressure way that does not require a reply
- Never use the words "first-gen", "first generation", or "first-generation" in the email body
- If the student is first-gen, do not name that identity. Instead, make the email more concrete about processes, locations, and what to expect

Return raw JSON only in this shape:
{
  "subject": "...",
  "body": "..."
}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://sundevilconnect.local",
        "X-Title": "SunDevilConnect Faculty Email",
      },
      body: JSON.stringify({
        model,
        temperature: 0.55,
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
            "The draft generator did not complete the request. Please try again in a moment.",
        },
        { status: response.status },
      );
    }

    const reply = extractReply(data.choices?.[0]?.message?.content);
    const draft = parseDraft(reply);

    if (!draft) {
      return NextResponse.json(
        {
          error:
            "The draft generator responded without a usable email. Try regenerating or adjust the settings.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(draft);
  } catch {
    return NextResponse.json(
      {
        error:
          "The draft generator is temporarily unavailable. You can still review the student profile and try again shortly.",
      },
      { status: 500 },
    );
  }
}
