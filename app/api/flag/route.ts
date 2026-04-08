import { NextRequest, NextResponse } from "next/server";

import { getDashboardStudent } from "@/lib/dashboard";
import type { DashboardFlag, DashboardFlagKind, DashboardRole } from "@/lib/types";

type FlagRequestBody = {
  studentId?: unknown;
  kind?: unknown;
  createdByRole?: unknown;
  createdById?: unknown;
  createdByName?: unknown;
  message?: unknown;
};

const validRoles = new Set<DashboardRole>(["faculty", "advisor"]);
const validKinds = new Set<DashboardFlagKind>(["review", "advisor-note"]);

export async function POST(request: NextRequest) {
  const body = (await request.json()) as FlagRequestBody;
  const studentId = typeof body.studentId === "string" ? body.studentId : null;
  const kind =
    typeof body.kind === "string" && validKinds.has(body.kind as DashboardFlagKind)
      ? (body.kind as DashboardFlagKind)
      : null;
  const createdByRole =
    typeof body.createdByRole === "string" && validRoles.has(body.createdByRole as DashboardRole)
      ? (body.createdByRole as DashboardRole)
      : null;
  const createdById = typeof body.createdById === "string" ? body.createdById : null;
  const createdByName = typeof body.createdByName === "string" ? body.createdByName : null;
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!studentId || !kind || !createdByRole || !createdById || !createdByName || !message) {
    return NextResponse.json({ error: "The flag request was incomplete." }, { status: 400 });
  }

  const student = getDashboardStudent(studentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const createdAt = new Date().toISOString();
  const flagId = `flag-${student.id}-${Date.now()}`;

  return NextResponse.json({
    studentId: student.id,
    flag: {
      id: flagId,
      kind,
      status: "open",
      createdByRole,
      createdById,
      createdByName,
      createdAt,
      message,
    } satisfies DashboardFlag,
    timelineEvent: {
      id: `${flagId}-timeline`,
      date: createdAt,
      type: "flag-created",
      actorId: createdById,
      actorName: createdByName,
      actorRole: createdByRole,
      summary:
        kind === "review"
          ? `Flagged for advisor review: ${message}`
          : `Left an advisor note: ${message}`,
      visibility: "shared",
    },
  });
}
