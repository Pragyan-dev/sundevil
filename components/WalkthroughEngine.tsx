"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ModeSelector } from "@/components/ModeSelector";
import { QuestionChecklist } from "@/components/QuestionChecklist";
import { ScenarioDetail } from "@/components/ScenarioDetail";
import { WalkthroughStep } from "@/components/WalkthroughStep";
import type {
  GeneratedQuestionsResult,
  Resource,
  ResourceWalkthrough,
  StudentContext,
  StudentYear,
  WalkthroughMode,
} from "@/lib/types";

interface WalkthroughEngineProps {
  resource: Resource;
  walkthrough: ResourceWalkthrough;
  studentContext: StudentContext;
}

function getYearLabel(year: StudentYear | null): string {
  switch (year) {
    case "first-year":
      return "First year";
    case "second-year":
      return "Second year";
    case "third-year":
      return "Third year";
    case "fourth-year-plus":
      return "Fourth year+";
    default:
      return "Student";
  }
}

function getExperienceLabel(experience: StudentContext["experience"]): string {
  switch (experience) {
    case "yes":
      return "Used resources before";
    case "no":
      return "First time using resources";
    case "not-sure":
      return "Not sure yet";
    default:
      return "Finder context";
  }
}

function getConcernLabel(concern: StudentContext["concern"]): string {
  switch (concern) {
    case "class":
      return "Concern: class support";
    case "money":
      return "Concern: money";
    case "overwhelmed":
      return "Concern: overwhelmed";
    case "schedule":
      return "Concern: schedule";
    case "something-else":
      return "Concern: something else";
    default:
      return "Concern: not set";
  }
}

export function WalkthroughEngine({
  resource,
  walkthrough,
  studentContext,
}: WalkthroughEngineProps) {
  const [selectedMode, setSelectedMode] = useState<WalkthroughMode>(walkthrough.modes[0].mode);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionsResult | null>(null);

  const selectedModeDefinition =
    walkthrough.modes.find((mode) => mode.mode === selectedMode) ?? walkthrough.modes[0];

  const defaultQuestions = useMemo(() => {
    const year = studentContext.year ?? "first-year";
    return walkthrough.questionSet.questionsByYear[year];
  }, [studentContext.year, walkthrough.questionSet.questionsByYear]);

  const activeQuestions = generatedQuestions?.questions ?? defaultQuestions;
  const activeOpener = generatedQuestions?.opener ?? walkthrough.questionSet.defaultOpener;
  const activeProTip = generatedQuestions?.proTip ?? walkthrough.questionSet.defaultProTip;
  const showReassurance = studentContext.experience === "no";
  const placeholder =
    walkthrough.questionSet.scenarioPlaceholders?.[studentContext.concern ?? "something-else"];

  function handleModeChange(mode: WalkthroughMode) {
    setSelectedMode(mode);
    setGeneratedQuestions(null);
  }

  return (
    <section className="page-shell pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/finder" className="button-secondary">
            ← Back to results
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href={resource.previewPath} className="button-secondary">
              Preview what it&apos;s like
            </Link>
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="button-primary">
              Official ASU page
            </a>
          </div>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="maroon-panel">
            <p className="eyebrow text-[var(--asu-gold)]">{resource.category}</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight text-[var(--warm-white)]">
              {walkthrough.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[rgba(255,251,245,0.84)]">
              {walkthrough.summary}
            </p>
            <p className="mt-6 max-w-2xl leading-7 text-[rgba(255,251,245,0.76)]">
              {resource.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="pill bg-white/10 text-[rgba(255,251,245,0.88)]">{getConcernLabel(studentContext.concern)}</span>
              <span className="pill bg-white/10 text-[rgba(255,251,245,0.88)]">{getYearLabel(studentContext.year)}</span>
              <span className="pill bg-white/10 text-[rgba(255,251,245,0.88)]">{getExperienceLabel(studentContext.experience)}</span>
            </div>
          </div>

          <div className="paper-card">
            <p className="eyebrow">How do you want to do this?</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
              Pick the format that feels easiest to try first
            </h2>
            <p className="mt-4 leading-7 text-[var(--muted-ink)]">
              The steps below will update when you switch modes. If you are not sure, start with
              the option that has the least friction for you right now.
            </p>

            <div className="mt-6">
              <ModeSelector
                modes={walkthrough.modes}
                value={selectedMode}
                onChange={handleModeChange}
              />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Walkthrough</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
                {selectedModeDefinition.label} step-by-step
              </h2>
            </div>
            <span className="pill">{selectedModeDefinition.steps.length} steps</span>
          </div>

          <div className="space-y-6">
            {selectedModeDefinition.steps.map((step, index) => (
              <WalkthroughStep
                key={step.id}
                step={step}
                index={index}
                showReassurance={showReassurance}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="paper-card">
            <p className="eyebrow">Questions to ask</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
              End with a short question list on your phone
            </h2>
            <p className="mt-4 leading-7 text-[var(--muted-ink)]">
              You can skip the AI step and use the built-in list, or add a little context and get
              a more tailored version for this exact situation.
            </p>

            {showReassurance && walkthrough.questionSet.firstTimeIntro ? (
              <div className="mt-5 rounded-[1.4rem] border border-[rgba(255,198,39,0.35)] bg-[rgba(255,198,39,0.12)] p-5">
                <p className="eyebrow">First-time note</p>
                <p className="mt-3 leading-7 text-[var(--ink)]/84">
                  {walkthrough.questionSet.firstTimeIntro}
                </p>
              </div>
            ) : null}

            <div className="mt-6">
              <ScenarioDetail
                key={`${resource.slug}-${selectedMode}`}
                resourceType={resource.slug}
                appointmentType={selectedMode}
                studentContext={studentContext}
                placeholder={placeholder}
                onQuestionsGenerated={setGeneratedQuestions}
              />
            </div>
          </div>

          <div className="paper-card">
            <QuestionChecklist
              key={`${selectedMode}-${generatedQuestions ? "ai" : "default"}-${activeQuestions.join("|")}`}
              opener={activeOpener}
              questions={activeQuestions}
              proTip={activeProTip}
              isAiGenerated={Boolean(generatedQuestions)}
            />
          </div>
        </section>
      </div>
    </section>
  );
}
