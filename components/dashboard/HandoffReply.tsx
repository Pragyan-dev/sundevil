"use client";

import Link from "next/link";
import { useState } from "react";

import { formatRelativeDate } from "@/lib/dashboard";
import type { DashboardStudent } from "@/lib/types";

import { useDashboardDemoState } from "./DashboardDemoProvider";

export function HandoffReply({ student }: { student: DashboardStudent }) {
  const { data, appendThreadReply, acknowledgeHandoff } = useDashboardDemoState();
  const latestHandoff = [...student.handoffs].sort((left, right) => Date.parse(right.date) - Date.parse(left.date))[0];
  const [reply, setReply] = useState(
    latestHandoff
      ? `Thanks for flagging. I’ll follow up this week and close the loop after I reach the student.`
      : "",
  );

  if (!latestHandoff) {
    return null;
  }

  function handleSend() {
    const text = reply.trim();
    if (!text) return;

    appendThreadReply({
      studentId: student.id,
      senderId: data.advisor.id,
      senderName: data.advisor.name,
      senderRole: "advisor",
      text,
    });
    acknowledgeHandoff(student.id, latestHandoff.id);
    setReply("");
  }

  return (
    <section className="paper-card">
      <p className="eyebrow">Reply to faculty</p>
      <div className="mt-5 rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.78)] p-5">
        <p className="text-sm font-semibold text-[var(--asu-maroon)]">
          {latestHandoff.fromName} · {formatRelativeDate(latestHandoff.date)}
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">{latestHandoff.message}</p>
      </div>
      <textarea
        className="field-shell mt-5 min-h-[9rem]"
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        placeholder="Thanks for the heads up..."
      />
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className="button-primary" onClick={handleSend}>
          Send to Faculty
        </button>
        <Link href={`/dashboard/messages?role=advisor&student=${student.id}`} className="button-secondary">
          Open thread
        </Link>
      </div>
    </section>
  );
}
