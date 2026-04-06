"use client";

import { useMemo, useState } from "react";

interface QuestionChecklistProps {
  opener?: string;
  questions: string[];
  proTip?: string;
  isAiGenerated: boolean;
}

export function QuestionChecklist({
  opener,
  questions,
  proTip,
  isAiGenerated,
}: QuestionChecklistProps) {
  const [checked, setChecked] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const textToCopy = useMemo(() => {
    const openerBlock = opener ? [`Walk-in opener: ${opener}`, ""] : [];
    const questionBlock = questions.map((question) => `- ${question}`);
    const proTipBlock = proTip ? ["", `Pro tip: ${proTip}`] : [];

    return [...openerBlock, "Questions to ask:", ...questionBlock, ...proTipBlock].join("\n");
  }, [opener, proTip, questions]);

  function toggleQuestion(question: string) {
    setChecked((current) =>
      current.includes(question)
        ? current.filter((item) => item !== question)
        : [...current, question],
    );
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{isAiGenerated ? "Personalized questions" : "Starter questions"}</p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--asu-maroon)]">
            {isAiGenerated ? "Questions tailored to your situation" : "A solid list you can use right now"}
          </h3>
        </div>
        <button type="button" onClick={handleCopy} className="button-primary">
          {copyState === "copied"
            ? "Copied"
            : copyState === "error"
              ? "Copy failed"
              : "Copy questions"}
        </button>
      </div>

      {opener ? (
        <div className="rounded-[1.4rem] border border-[rgba(255,198,39,0.36)] bg-[rgba(255,198,39,0.12)] p-5">
          <p className="eyebrow">Walk-in opener</p>
          <p className="mt-3 text-lg leading-8 text-[var(--ink)]/86">{opener}</p>
        </div>
      ) : null}

      <div className="grid gap-3">
        {questions.map((question, index) => {
          const active = checked.includes(question);

          return (
            <button
              key={question}
              type="button"
              onClick={() => toggleQuestion(question)}
              aria-pressed={active}
              className={`flex items-start gap-4 rounded-[1.35rem] border p-4 text-left transition-colors ${
                active
                  ? "border-[rgba(255,198,39,0.52)] bg-[rgba(255,198,39,0.15)]"
                  : "border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)]"
              }`}
            >
              <span
                className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                  active
                    ? "border-[rgba(140,29,64,0.24)] bg-[var(--asu-maroon)] text-[var(--warm-white)]"
                    : "border-[rgba(140,29,64,0.14)] text-[var(--asu-maroon)]"
                }`}
              >
                {active ? "✓" : index + 1}
              </span>
              <span className="leading-7 text-[var(--ink)]/85">{question}</span>
            </button>
          );
        })}
      </div>

      {proTip ? (
        <div className="rounded-[1.4rem] border border-[rgba(140,29,64,0.12)] bg-[rgba(140,29,64,0.05)] p-5">
          <p className="eyebrow">Pro tip</p>
          <p className="mt-3 leading-7 text-[var(--ink)]/84">{proTip}</p>
        </div>
      ) : null}
    </div>
  );
}
