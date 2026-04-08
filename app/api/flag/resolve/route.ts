import { NextRequest, NextResponse } from "next/server";

import { getDashboardStudent } from "@/lib/dashboard";

type ResolveFlagRequestBody = {
  studentId?: unknown;
  flagId?: unknown;
  resolvedById?: unknown;
  resolvedByName?: unknown;
  resolutionNote?: unknown;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ResolveFlagRequestBody;
  const studentId = typeof body.studentId === "string" ? body.studentId : null;
  const flagId = typeof body.flagId === "string" ? body.flagId : null;
  const resolvedById = typeof body.resolvedById === "string" ? body.resolvedById : null;
  const resolvedByName = typeof body.resolvedByName === "string" ? body.resolvedByName : null;
  const resolutionNote =
    typeof body.resolutionNote === "string" && body.resolutionNote.trim()
      ? body.resolutionNote.trim()
      : undefined;

  if (!studentId || !flagId || !resolvedById || !resolvedByName) {
    return NextResponse.json({ error: "The resolve request was incomplete." }, { status: 400 });
  }

  const student = getDashboardStudent(studentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const flag = student.flags.find((item) => item.id === flagId);
  if (!flag || flag.kind !== "review") {
    return NextResponse.json({ error: "Review flag not found." }, { status: 404 });
  }

  if (flag.status === "resolved") {
    return NextResponse.json({ error: "This flag is already resolved." }, { status: 400 });
  }

  const resolvedAt = new Date().toISOString();

  return NextResponse.json({
    studentId: student.id,
    flagId,
    resolvedAt,
    resolvedById,
    resolvedByName,
    resolutionNote,
    timelineEvent: {
      id: `${flagId}-resolved`,
      date: resolvedAt,
      type: "flag-resolved",
      actorId: resolvedById,
      actorName: resolvedByName,
      actorRole: "advisor",
      summary: resolutionNote
        ? `Resolved a faculty review flag and shared a note: ${resolutionNote}`
        : "Resolved a faculty review flag.",
      visibility: "shared",
    },
  });
}
