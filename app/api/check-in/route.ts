import { NextRequest, NextResponse } from "next/server";

import { getDashboardStudent } from "@/lib/dashboard";
import type { DashboardBlocker, DashboardMood } from "@/lib/types";

type CheckInRequestBody = {
  studentId?: unknown;
  week?: unknown;
  mood?: unknown;
  blocker?: unknown;
  wantsOutreach?: unknown;
  date?: unknown;
};

const validMoods = new Set<DashboardMood>(["great", "okay", "meh", "struggling", "drowning"]);
const validBlockers = new Set<DashboardBlocker>(["none", "money", "academics", "health", "personal"]);

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CheckInRequestBody;
  const studentId = typeof body.studentId === "string" ? body.studentId : null;
  const week = typeof body.week === "number" ? body.week : null;
  const mood =
    typeof body.mood === "string" && validMoods.has(body.mood as DashboardMood)
      ? (body.mood as DashboardMood)
      : null;
  const blocker =
    typeof body.blocker === "string" && validBlockers.has(body.blocker as DashboardBlocker)
      ? (body.blocker as DashboardBlocker)
      : null;
  const wantsOutreach = typeof body.wantsOutreach === "boolean" ? body.wantsOutreach : null;
  const date = typeof body.date === "string" ? body.date : new Date().toISOString();

  if (!studentId || week === null || !mood || !blocker || wantsOutreach === null) {
    return NextResponse.json({ error: "The self-check-in request was incomplete." }, { status: 400 });
  }

  const student = getDashboardStudent(studentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const id = `checkin-${student.id}-${week}-${Date.now()}`;

  return NextResponse.json({
    studentId: student.id,
    checkIn: {
      studentId: student.id,
      week,
      mood,
      blocker,
      wantsOutreach,
      date,
    },
    timelineEvent: {
      id,
      date,
      type: "check-in",
      actorId: student.id,
      actorName: student.firstName,
      actorRole: "student",
      summary: `Self-check-in: ${mood} · ${blocker} · ${wantsOutreach ? "asked for outreach" : "no outreach requested"}.`,
      visibility: "shared",
    },
  });
}
