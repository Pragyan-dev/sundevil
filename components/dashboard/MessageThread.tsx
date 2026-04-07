"use client";

import { formatTimestamp } from "@/lib/dashboard";
import type { DashboardRole, DashboardStudent, MessageThread as MessageThreadType } from "@/lib/types";

import { useDashboardDemoState } from "./DashboardDemoProvider";
import { MessageComposer } from "./MessageComposer";

export function MessageThread({
  role,
  student,
  thread,
  senderId,
  senderName,
}: {
  role: DashboardRole;
  student: DashboardStudent;
  thread: MessageThreadType;
  senderId: string;
  senderName: string;
}) {
  const { appendThreadReply } = useDashboardDemoState();

  return (
    <section className="paper-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Thread</p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--asu-maroon)]">
            {student.initials} · {student.firstName}
          </h2>
        </div>
        <span className="pill">{thread.messages.length} messages</span>
      </div>

      <div className="mt-6 space-y-4">
        {thread.messages.map((message) => (
          <article
            key={message.id}
            className="rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.8)] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--asu-maroon)]">
                {message.senderName} · {message.senderRole}
              </p>
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                {formatTimestamp(message.date)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">{message.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-6">
        <MessageComposer
          placeholder="Type a reply..."
          onSend={(text) =>
            appendThreadReply({
              studentId: student.id,
              senderId,
              senderName,
              senderRole: role,
              text,
            })
          }
        />
      </div>
    </section>
  );
}
