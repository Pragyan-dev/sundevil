"use client";

import { useMemo, useState, useTransition } from "react";

import { getDefaultFocusArea, getResourceOptionsForEmail, getSimulationSupportLink } from "@/lib/dashboard";
import type {
  DashboardEmailFocusArea,
  DashboardEmailTone,
  DashboardRole,
  DashboardStudent,
  FacultyEmailDraft,
  ResourceSlug,
} from "@/lib/types";

const toneOptions: Array<{ value: DashboardEmailTone; label: string }> = [
  { value: "warm", label: "Warm" },
  { value: "direct", label: "Direct" },
  { value: "encouraging", label: "Encouraging" },
];

const focusOptions: Array<{ value: DashboardEmailFocusArea; label: string }> = [
  { value: "academic", label: "Academic support" },
  { value: "navigation", label: "Navigation & orientation" },
  { value: "tutoring", label: "Tutoring" },
  { value: "advising", label: "Advising" },
  { value: "financial", label: "Financial support" },
  { value: "general", label: "General support" },
];

interface EmailComposerProps {
  role: DashboardRole;
  student: DashboardStudent;
  senderName: string;
  campus: string;
  contextLabel: string;
  onOutreachLogged?: (summary: string) => void;
}

export function EmailComposer({
  role,
  student,
  senderName,
  campus,
  contextLabel,
  onOutreachLogged,
}: EmailComposerProps) {
  const resourceOptions = useMemo(() => getResourceOptionsForEmail(student), [student]);
  const simulationLink = getSimulationSupportLink(student);
  const [tone, setTone] = useState<DashboardEmailTone>("warm");
  const [focusArea, setFocusArea] = useState<DashboardEmailFocusArea>(getDefaultFocusArea(student));
  const [includeSimLink, setIncludeSimLink] = useState(true);
  const [includeResourceType, setIncludeResourceType] = useState<ResourceSlug | "none">(
    student.recommendedResource.type,
  );
  const [draft, setDraft] = useState<FacultyEmailDraft | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const endpoint = role === "faculty" ? "/api/faculty-email" : "/api/advisor-email";
  const buttonLabel = role === "faculty" ? "Generate faculty draft" : "Generate advisor draft";

  async function handleGenerate() {
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            role === "faculty"
              ? {
                  studentId: student.id,
                  professorName: senderName,
                  courseName: contextLabel,
                  campus,
                  tone,
                  focusArea,
                  includeSimLink,
                  includeResourceType: includeResourceType === "none" ? null : includeResourceType,
                }
              : {
                  studentId: student.id,
                  advisorName: senderName,
                  department: contextLabel,
                  campus,
                  tone,
                  focusArea,
                  includeSimLink,
                  includeResourceType: includeResourceType === "none" ? null : includeResourceType,
                },
          ),
        });

        const result = (await response.json()) as
          | FacultyEmailDraft
          | {
              error?: string;
            };

        if (!response.ok || !("subject" in result) || !("body" in result)) {
          throw new Error(
            "error" in result && result.error
              ? result.error
              : "The email draft could not be generated right now.",
          );
        }

        setDraft(result);
        setSubject(result.subject);
        setBody(result.body);
      } catch (generationError) {
        setError(
          generationError instanceof Error
            ? generationError.message
            : "The email draft could not be generated right now.",
        );
      }
    });
  }

  async function handleCopy() {
    if (!draft) return;

    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setFeedback("Draft copied to clipboard.");
      onOutreachLogged?.(`Copied a ${tone} ${role} draft for ${student.firstName}.`);
    } catch {
      setError("Clipboard access failed. You can still select the draft manually.");
    }
  }

  function handleOpenInMail() {
    if (!draft) return;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFeedback("Opened the draft in your mail app.");
    onOutreachLogged?.(`Opened a ${tone} ${role} draft in Mail for ${student.firstName}.`);
  }

  return (
    <section id="email-composer" className="paper-card scroll-mt-28">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Write email</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">
            {role === "faculty" ? "Faculty outreach" : "Advisor outreach"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-ink)]">
            This draft uses the student’s current dashboard context, resource path, and simulation
            state. Sensitive labels never appear in the email body.
          </p>
        </div>
        <button type="button" className="button-primary" onClick={handleGenerate} disabled={isPending}>
          {isPending ? "Generating..." : `✨ ${buttonLabel}`}
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[var(--asu-maroon)]">Tone</span>
          <select
            className="field-shell"
            value={tone}
            onChange={(event) => setTone(event.target.value as DashboardEmailTone)}
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
            onChange={(event) => setFocusArea(event.target.value as DashboardEmailFocusArea)}
          >
            {focusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[var(--asu-maroon)]">Include resource</span>
          <select
            className="field-shell"
            value={includeResourceType}
            onChange={(event) => setIncludeResourceType(event.target.value as ResourceSlug | "none")}
          >
            <option value="none">No direct resource link</option>
            {resourceOptions.map((resource) => (
              <option key={resource.slug} value={resource.slug}>
                {resource.name}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-[1.35rem] border border-[rgba(140,29,64,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
          <p className="text-sm font-semibold text-[var(--asu-maroon)]">Optional simulation link</p>
          <label className="mt-3 flex items-start gap-3 text-sm leading-6 text-[var(--ink)]/84">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[var(--asu-maroon)]"
              checked={includeSimLink}
              onChange={(event) => setIncludeSimLink(event.target.checked)}
            />
            <span>
              Include <strong>{simulationLink.label}</strong> so the student can preview the support
              step before trying it.
            </span>
          </label>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-[1.2rem] border border-[#C62828]/15 bg-[#C62828]/8 px-4 py-3 text-sm text-[#8B1E1E]">
          {error}
        </div>
      ) : null}

      {feedback ? (
        <div className="mt-5 rounded-[1.2rem] border border-[rgba(46,125,50,0.15)] bg-[rgba(46,125,50,0.08)] px-4 py-3 text-sm text-[#2E7D32]">
          {feedback}
        </div>
      ) : null}

      <div className="mt-6 rounded-[1.8rem] border border-[rgba(140,29,64,0.12)] bg-[rgba(255,255,255,0.82)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.05)]">
        {draft ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-ink)]">Subject</p>
              <input
                className="field-shell mt-2"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-ink)]">Body</p>
              <textarea
                className="field-shell mt-2 min-h-[18rem]"
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" className="button-primary" onClick={handleCopy}>
                Copy
              </button>
              <button type="button" className="button-secondary" onClick={handleOpenInMail}>
                Open in Mail
              </button>
              <button type="button" className="button-secondary" onClick={handleGenerate} disabled={isPending}>
                {isPending ? "Regenerating..." : "Regenerate"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-[rgba(140,29,64,0.2)] bg-[rgba(140,29,64,0.03)] px-5 py-8">
            <p className="text-sm font-semibold text-[var(--asu-maroon)]">Generated draft preview</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-ink)]">
              The draft appears here with an editable subject and body once you generate it.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
