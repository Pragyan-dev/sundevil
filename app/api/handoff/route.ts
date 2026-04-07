import { NextRequest, NextResponse } from "next/server";

import { getAdvisorContext, getDashboardStudent } from "@/lib/dashboard";
import type { DashboardRole, DashboardStudent } from "@/lib/types";

type HandoffRequestBody = {
  studentId?: unknown;
  fromRole?: unknown;
  fromId?: unknown;
  fromName?: unknown;
  toId?: unknown;
  message?: unknown;
};

const validRoles = new Set<DashboardRole>(["faculty", "advisor"]);

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandoffRequestBody;
  const studentId = typeof body.studentId === "string" ? body.studentId : null;
  const fromRole =
    typeof body.fromRole === "string" && validRoles.has(body.fromRole as DashboardRole)
      ? (body.fromRole as DashboardRole)
      : null;
  const fromId = typeof body.fromId === "string" ? body.fromId : null;
  const fromName = typeof body.fromName === "string" ? body.fromName : null;
  const toId = typeof body.toId === "string" ? body.toId : null;
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!studentId || !fromRole || !fromId || !fromName || !toId || !message) {
    return NextResponse.json({ error: "The handoff request was incomplete." }, { status: 400 });
  }

  const student = getDashboardStudent(studentId);
  const advisor = getAdvisorContext();

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  if (toId !== student.advisorId || toId !== advisor.id) {
    return NextResponse.json({ error: "Advisor assignment did not match this student." }, { status: 400 });
  }

  const date = new Date().toISOString();
  const baseId = `handoff-${student.id}-${Date.now()}`;

  return NextResponse.json({
    studentId: student.id,
    handoff: {
      id: baseId,
      fromId,
      fromName,
      fromRole,
      toId: advisor.id,
      toName: advisor.name,
      date,
      message,
      acknowledged: false,
    } satisfies DashboardStudent["handoffs"][number],
    threadMessage: {
      id: `${baseId}-message`,
      senderId: fromId,
      senderName: fromName,
      senderRole: fromRole,
      date,
      type: "handoff",
      text: message,
    },
    timelineEvent: {
      id: `${baseId}-timeline`,
      date,
      type: "handoff",
      actorId: fromId,
      actorName: fromName,
      actorRole: fromRole,
      summary: `Sent a handoff to ${advisor.name}: ${message}`,
      visibility: "shared",
    },
  });
}
