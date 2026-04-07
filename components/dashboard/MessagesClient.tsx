"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { getThreadStudentOptions } from "@/lib/dashboard";
import type { DashboardRole } from "@/lib/types";

import { MessageThread } from "./MessageThread";
import { useDashboardDemoState } from "./DashboardDemoProvider";

export function MessagesClient({
  role,
  selectedStudentId,
}: {
  role: DashboardRole;
  selectedStudentId: string | null;
}) {
  const router = useRouter();
  const { data } = useDashboardDemoState();

  const threadOptions = useMemo(
    () => getThreadStudentOptions(data.messages, data.students),
    [data.messages, data.students],
  );

  const activeStudentId = selectedStudentId ?? threadOptions[0]?.id ?? null;
  const student = activeStudentId ? data.students.find((item) => item.id === activeStudentId) : null;
  const thread = activeStudentId ? data.messages.find((item) => item.studentId === activeStudentId) : null;

  return (
    <div className="page-shell pb-12">
      <div className="mx-auto max-w-[92rem] space-y-8">
        <section className="maroon-panel">
          <p className="eyebrow !text-[rgba(255,255,255,0.72)]">Shared messages</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--warm-white)] sm:text-5xl">
            Faculty-advisor coordination
          </h1>
          <p className="mt-4 text-lg leading-8 text-[rgba(255,255,255,0.84)]">
            One thread per student, with role-aware replies and handoffs anchored to the same story.
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <section className="paper-card">
            <p className="eyebrow">Threads</p>
            <div className="mt-5 space-y-3">
              {threadOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/messages?role=${role}&student=${option.id}`)}
                  className={`w-full rounded-[1.35rem] border px-4 py-4 text-left ${
                    option.id === activeStudentId
                      ? "border-[rgba(140,29,64,0.2)] bg-[rgba(140,29,64,0.06)]"
                      : "border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.78)]"
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--asu-maroon)]">{option.label}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">{option.description}</p>
                </button>
              ))}
            </div>
          </section>

          {student && thread ? (
            <MessageThread
              role={role}
              student={student}
              thread={thread}
              senderId={role === "faculty" ? data.faculty.id : data.advisor.id}
              senderName={role === "faculty" ? data.faculty.name : data.advisor.name}
            />
          ) : (
            <section className="paper-card">
              <p className="text-sm leading-7 text-[var(--muted-ink)]">No thread selected yet.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
