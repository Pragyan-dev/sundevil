"use client";

import { useState } from "react";

import type {
  GeneratedQuestionsResult,
  ResourceSlug,
  StudentContext,
  WalkthroughMode,
} from "@/lib/types";

interface ScenarioDetailProps {
  resourceType: ResourceSlug;
  appointmentType: WalkthroughMode;
  studentContext: StudentContext;
  placeholder?: string;
  onQuestionsGenerated: (result: GeneratedQuestionsResult) => void;
}

export function ScenarioDetail({
  resourceType,
  appointmentType,
  studentContext,
  placeholder,
  onQuestionsGenerated,
}: ScenarioDetailProps) {
  const [situation, setSituation] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    const trimmed = situation.trim();

    if (!trimmed) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          situation: trimmed,
          resourceType,
          appointmentType,
          concern: studentContext.concern,
          year: studentContext.year,
          experience: studentContext.experience,
        }),
      });

      const data = (await response.json()) as
        | GeneratedQuestionsResult
        | {
            error?: string;
          };

      if (!response.ok || !("questions" in data)) {
        setStatus("error");
        setError(
          "Could not generate personalized questions right now. You can still use the default questions below.",
        );
        return;
      }

      onQuestionsGenerated(data);
      setStatus("idle");
    } catch {
      setStatus("error");
      setError(
        "Could not generate personalized questions right now. You can still use the default questions below.",
      );
    }
  }

  return (
    <div className="space-y-4 rounded-[1.6rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.82)] p-5">
      <div>
        <p className="eyebrow">Optional</p>
        <h3 className="mt-2 text-2xl font-semibold text-[var(--asu-maroon)]">
          Describe your situation for personalized questions
        </h3>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--muted-ink)]">
          This only affects the questions at the end. The walkthrough still works if you skip it.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="eyebrow">Your situation</span>
        <textarea
          className="field-shell min-h-32 resize-y"
          value={situation}
          onChange={(event) => {
            setSituation(event.target.value);
            if (error) {
              setError(null);
              setStatus("idle");
            }
          }}
          placeholder={placeholder ?? "Describe what is confusing, stressful, or urgent for you."}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="button-primary"
          onClick={handleGenerate}
          disabled={!situation.trim() || status === "loading"}
        >
          {status === "loading" ? "Generating questions..." : "Generate my questions"}
        </button>
        <span className="text-sm text-[var(--muted-ink)]">
          Uses your finder answers plus anything you type here.
        </span>
      </div>

      {error ? <p className="text-sm text-[var(--asu-maroon)]">{error}</p> : null}
    </div>
  );
}
