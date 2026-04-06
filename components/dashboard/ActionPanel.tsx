"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  dashboardClassContext,
  getFacultyRead,
  getRecommendedResource,
  getSuggestedCheckInPrompts,
  getSimulationSupportLink,
} from "@/lib/dashboard";
import type { DashboardOutreachItem, DashboardStudent } from "@/lib/types";

import { EmailComposer } from "./EmailComposer";
import { OutreachHistory } from "./OutreachHistory";

interface ActionPanelProps {
  student: DashboardStudent;
}

function buildSessionItem(type: DashboardOutreachItem["type"], summary: string): DashboardOutreachItem {
  return {
    date: new Date().toISOString(),
    type,
    summary,
  };
}

export function ActionPanel({ student }: ActionPanelProps) {
  const [sessionItems, setSessionItems] = useState<DashboardOutreachItem[]>([]);
  const [isStable, setIsStable] = useState(false);

  const facultyRead = useMemo(() => getFacultyRead(student), [student]);
  const prompts = useMemo(() => getSuggestedCheckInPrompts(student), [student]);
  const resource = getRecommendedResource(student);
  const simulationLink = getSimulationSupportLink(student);
  const outreachItems = [...sessionItems, ...student.outreachHistory];

  function addSessionItem(item: DashboardOutreachItem) {
    setSessionItems((current) => [item, ...current]);
  }

  function logCheckIn() {
    addSessionItem(
      buildSessionItem(
        "check-in",
        `Logged a live check-in about ${student.supportFocus.toLowerCase()}.`,
      ),
    );
  }

  function handleMarkStable() {
    setIsStable((current) => !current);

    if (!isStable) {
      addSessionItem(
        buildSessionItem(
          "note",
          `Marked ${student.firstName} as stable for this session after reviewing the current signal mix.`,
        ),
      );
    }
  }

  return (
    <div className="space-y-6">
      <section className="paper-card">
        <p className="eyebrow">What faculty sees</p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">Faculty read</h2>
        <p className="mt-5 text-base leading-8 text-[var(--ink)]/84">{facultyRead}</p>
        {isStable ? (
          <div className="mt-5 inline-flex items-center rounded-full border border-[rgba(46,125,50,0.18)] bg-[rgba(46,125,50,0.08)] px-4 py-2 text-sm font-medium text-[#2E7D32]">
            Marked stable for this review session
          </div>
        ) : null}
      </section>

      <section className="paper-card">
        <p className="eyebrow">Recommended actions</p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">
          The next move should feel concrete
        </h2>

        <div className="mt-5 space-y-4">
          <article className="rounded-[1.5rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.78)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-semibold text-[var(--asu-maroon)]">Send personalized email</p>
              <span className="pill">Primary</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">{student.supportFocus}</p>
          </article>

          <article className="rounded-[1.5rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.78)] p-5">
            <p className="text-lg font-semibold text-[var(--asu-maroon)]">Include simulation link</p>
            <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">
              {simulationLink.label} helps make the process visible before the student has to guess
              what the room, meeting, or first step looks like.
            </p>
            <Link href={simulationLink.href} className="button-secondary mt-4">
              Open {simulationLink.label}
            </Link>
          </article>

          {resource ? (
            <article className="rounded-[1.5rem] border border-[rgba(255,198,39,0.24)] bg-[rgba(255,198,39,0.1)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg font-semibold text-[var(--asu-maroon)]">{resource.name}</p>
                <span className="pill">{resource.category}</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">{resource.description}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-white/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">Location</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink)]/84">{resource.location}</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">What to expect</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink)]/84">{resource.signUpSummary}</p>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </section>

      <section className="paper-card">
        <p className="eyebrow">Suggested check-in prompts</p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">
          Short questions you can ask out loud
        </h2>
        <div className="mt-5 space-y-3">
          {prompts.map((prompt) => (
            <div
              key={prompt}
              className="rounded-[1.3rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] px-4 py-3 text-sm leading-7 text-[var(--ink)]/84"
            >
              • {prompt}
            </div>
          ))}
        </div>
      </section>

      <EmailComposer
        student={student}
        professorName={dashboardClassContext.professorMailName}
        courseName={`${dashboardClassContext.courseCode} ${dashboardClassContext.courseName}`}
        campus={dashboardClassContext.campus}
        onOutreachLogged={addSessionItem}
      />

      <section className="paper-card">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Outreach history</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">
              What happened in this review session
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="button-secondary" onClick={logCheckIn}>
              Log a check-in
            </button>
            <button type="button" className="button-primary" onClick={handleMarkStable}>
              {isStable ? "Unmark stable" : "Mark as stable"}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <OutreachHistory items={outreachItems} />
        </div>
      </section>
    </div>
  );
}
