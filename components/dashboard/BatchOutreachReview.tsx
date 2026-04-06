"use client";

import { useMemo, useState, useTransition } from "react";

import {
  dashboardClassContext,
  getPatternFocusArea,
  getPatternTitle,
  getRecommendedResource,
} from "@/lib/dashboard";
import type {
  CohortPattern,
  DashboardStudent,
  FacultyEmailDraft,
  FacultyEmailFocusArea,
  FacultyEmailTone,
  ResourceSlug,
} from "@/lib/types";

const toneOptions: Array<{ value: FacultyEmailTone; label: string }> = [
  { value: "warm", label: "Warm" },
  { value: "direct", label: "Direct" },
  { value: "encouraging", label: "Encouraging" },
];

const focusOptions: Array<{ value: FacultyEmailFocusArea; label: string }> = [
  { value: "navigation", label: "Navigation & orientation" },
  { value: "tutoring", label: "Tutoring" },
  { value: "advising", label: "Advising" },
  { value: "general", label: "General support" },
];

interface BatchOutreachReviewProps {
  pattern: CohortPattern;
  students: DashboardStudent[];
}

type DraftMap = Record<string, FacultyEmailDraft>;
type ErrorMap = Record<string, string>;

async function requestDraft(input: {
  studentId: string;
  tone: FacultyEmailTone;
  focusArea: FacultyEmailFocusArea;
  includeSimLink: boolean;
  includeResourceType: ResourceSlug | null;
}) {
  const response = await fetch("/api/faculty-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      studentId: input.studentId,
      professorName: dashboardClassContext.professorMailName,
      courseName: `${dashboardClassContext.courseCode} ${dashboardClassContext.courseName}`,
      campus: dashboardClassContext.campus,
      tone: input.tone,
      focusArea: input.focusArea,
      includeSimLink: input.includeSimLink,
      includeResourceType: input.includeResourceType,
    }),
  });

  const result = (await response.json()) as FacultyEmailDraft | { error?: string };
  if (!response.ok || !("subject" in result) || !("body" in result)) {
    throw new Error(
      "error" in result && result.error
        ? result.error
        : "This draft could not be generated right now.",
    );
  }

  return result;
}

export function BatchOutreachReview({ pattern, students }: BatchOutreachReviewProps) {
  const [tone, setTone] = useState<FacultyEmailTone>("warm");
  const [focusArea, setFocusArea] = useState<FacultyEmailFocusArea>(getPatternFocusArea(pattern.id));
  const [includeSimLink, setIncludeSimLink] = useState(true);
  const [includeRecommendedResource, setIncludeRecommendedResource] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? "");
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [errors, setErrors] = useState<ErrorMap>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? students[0];
  const selectedDraft = selectedStudent ? drafts[selectedStudent.id] : null;
  const selectedError = selectedStudent ? errors[selectedStudent.id] : null;

  async function generateOne(student: DashboardStudent) {
    return requestDraft({
      studentId: student.id,
      tone,
      focusArea,
      includeSimLink,
      includeResourceType: includeRecommendedResource
        ? getRecommendedResource(student)?.slug ?? null
        : null,
    });
  }

  function generateAllDrafts() {
    setFeedback(null);
    startTransition(async () => {
      const settled = await Promise.allSettled(
        students.map(async (student) => ({
          studentId: student.id,
          draft: await generateOne(student),
        })),
      );

      const nextDrafts: DraftMap = {};
      const nextErrors: ErrorMap = {};

      settled.forEach((result, index) => {
        const student = students[index];
        if (!student) return;

        if (result.status === "fulfilled") {
          nextDrafts[student.id] = result.value.draft;
        } else {
          nextErrors[student.id] =
            result.reason instanceof Error
              ? result.reason.message
              : "This draft could not be generated.";
        }
      });

      setDrafts(nextDrafts);
      setErrors(nextErrors);
      setSelectedStudentId((current) => current || students[0]?.id || "");
      setFeedback(
        Object.keys(nextDrafts).length
          ? `Generated ${Object.keys(nextDrafts).length} individualized drafts.`
          : "No drafts were generated.",
      );
    });
  }

  function regenerateSelected() {
    if (!selectedStudent) return;

    setFeedback(null);
    startTransition(async () => {
      try {
        const draft = await generateOne(selectedStudent);
        setDrafts((current) => ({ ...current, [selectedStudent.id]: draft }));
        setErrors((current) => {
          const next = { ...current };
          delete next[selectedStudent.id];
          return next;
        });
        setFeedback(`Regenerated the draft for ${selectedStudent.initials}.`);
      } catch (generationError) {
        setErrors((current) => ({
          ...current,
          [selectedStudent.id]:
            generationError instanceof Error
              ? generationError.message
              : "This draft could not be generated.",
        }));
      }
    });
  }

  async function copySelected() {
    if (!selectedDraft || !selectedStudent) return;

    try {
      await navigator.clipboard.writeText(
        `Subject: ${selectedDraft.subject}\n\n${selectedDraft.body}`,
      );
      setFeedback(`Copied ${selectedStudent.initials}'s draft.`);
    } catch {
      setFeedback("Clipboard access failed. You can still copy from the preview panel.");
    }
  }

  function openSelectedInMail() {
    if (!selectedDraft) return;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      selectedDraft.subject,
    )}&body=${encodeURIComponent(selectedDraft.body)}`;
  }

  function openNextInMail() {
    const readyStudents = students.filter((student) => drafts[student.id]);
    if (!readyStudents.length) return;

    const currentIndex = readyStudents.findIndex((student) => student.id === selectedStudentId);
    const nextStudent =
      readyStudents[currentIndex >= 0 && currentIndex < readyStudents.length - 1 ? currentIndex + 1 : 0];

    if (!nextStudent) return;

    setSelectedStudentId(nextStudent.id);
    const nextDraft = drafts[nextStudent.id];
    if (!nextDraft) return;

    window.location.href = `mailto:?subject=${encodeURIComponent(
      nextDraft.subject,
    )}&body=${encodeURIComponent(nextDraft.body)}`;
  }

  const readyCount = useMemo(
    () => students.filter((student) => drafts[student.id]).length,
    [drafts, students],
  );

  return (
    <div className="space-y-8">
      <section className="paper-card-featured maroon-panel text-[var(--warm-white)]">
        <p className="eyebrow !text-[rgba(255,255,255,0.75)]">Batch outreach</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-white">
          {getPatternTitle(pattern)}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[rgba(255,255,255,0.84)]">
          Pattern matched: <strong>{students.length}</strong> students. Drafts are individualized in
          parallel, but nothing is sent automatically. Review first, then hand off to your mail app.
        </p>
      </section>

      <section className="paper-card">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--asu-maroon)]">Tone</span>
            <select
              className="field-shell"
              value={tone}
              onChange={(event) => setTone(event.target.value as FacultyEmailTone)}
            >
              {toneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--asu-maroon)]">Focus</span>
            <select
              className="field-shell"
              value={focusArea}
              onChange={(event) => setFocusArea(event.target.value as FacultyEmailFocusArea)}
            >
              {focusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <label className="pill gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--asu-maroon)]"
              checked={includeSimLink}
              onChange={(event) => setIncludeSimLink(event.target.checked)}
            />
            Include simulation link
          </label>
          <label className="pill gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--asu-maroon)]"
              checked={includeRecommendedResource}
              onChange={(event) => setIncludeRecommendedResource(event.target.checked)}
            />
            Include recommended resource detail
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="button-primary" onClick={generateAllDrafts} disabled={isPending}>
            {isPending ? "Generating..." : `Generate all drafts (${students.length})`}
          </button>
          <button type="button" className="button-secondary" onClick={openNextInMail} disabled={!readyCount}>
            Open next draft in Mail
          </button>
          <span className="pill">{readyCount}/{students.length} ready</span>
        </div>

        {feedback ? (
          <div className="mt-5 rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-[rgba(140,29,64,0.04)] px-4 py-3 text-sm text-[var(--asu-maroon)]">
            {feedback}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="paper-card">
          <p className="eyebrow">Students in this batch</p>
          <div className="mt-5 space-y-3">
            {students.map((student) => {
              const ready = Boolean(drafts[student.id]);
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full rounded-[1.4rem] border p-4 text-left transition ${
                    selectedStudentId === student.id
                      ? "border-[rgba(140,29,64,0.24)] bg-[rgba(140,29,64,0.07)]"
                      : "border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--asu-maroon)]">{student.initials}</p>
                      <p className="mt-1 text-sm text-[var(--muted-ink)]">{student.major}</p>
                    </div>
                    <span className="pill">{ready ? "Ready" : "Waiting"}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--ink)]/84">{student.supportFocus}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="paper-card">
          {selectedStudent ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Review one draft</p>
                  <h2 className="mt-3 text-3xl font-[family-name:var(--font-display)] text-[var(--asu-maroon)]">
                    {selectedStudent.initials}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">
                    {selectedStudent.supportFocus}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={regenerateSelected}
                    disabled={isPending}
                  >
                    {isPending ? "Regenerating..." : "Regenerate"}
                  </button>
                  <button type="button" className="button-secondary" onClick={copySelected} disabled={!selectedDraft}>
                    Copy
                  </button>
                  <button
                    type="button"
                    className="button-primary"
                    onClick={openSelectedInMail}
                    disabled={!selectedDraft}
                  >
                    Open in Mail
                  </button>
                </div>
              </div>

              {selectedError ? (
                <div className="mt-5 rounded-[1.2rem] border border-[#C62828]/15 bg-[#C62828]/8 px-4 py-3 text-sm text-[#8B1E1E]">
                  {selectedError}
                </div>
              ) : null}

              <div className="mt-6 rounded-[1.7rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.82)] p-5">
                {selectedDraft ? (
                  <>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-ink)]">Subject</p>
                    <input
                      className="field-shell mt-2"
                      value={selectedDraft.subject}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [selectedStudent.id]: {
                            ...selectedDraft,
                            subject: event.target.value,
                          },
                        }))
                      }
                    />
                    <p className="mt-5 text-xs uppercase tracking-[0.16em] text-[var(--muted-ink)]">Body</p>
                    <textarea
                      className="field-shell mt-2 min-h-[18rem]"
                      value={selectedDraft.body}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [selectedStudent.id]: {
                            ...selectedDraft,
                            body: event.target.value,
                          },
                        }))
                      }
                    />
                  </>
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-[rgba(140,29,64,0.18)] bg-[rgba(140,29,64,0.03)] px-5 py-8">
                    <p className="text-sm font-semibold text-[var(--asu-maroon)]">No draft yet</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">
                      Generate the batch first, then review each student one by one.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
