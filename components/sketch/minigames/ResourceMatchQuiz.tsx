"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { SoundEngineControls } from "@/components/sketch/SoundEngine";
import MiniGameShell from "@/components/sketch/minigames/MiniGameShell";

const scenarios = [
  {
    id: "s1",
    situation:
      "You got a 52 on your first math quiz and the concepts aren't clicking no matter how many times you reread the textbook.",
    correctAnswer: "tutoring",
    options: [
      { id: "tutoring", label: "Tutoring Center", icon: "📚" },
      { id: "advising", label: "Academic Advising", icon: "🗺️" },
      { id: "counseling", label: "Counseling Services", icon: "💚" },
      { id: "financial", label: "Financial Coaching", icon: "💰" },
    ],
    explanation:
      "When specific course material isn't clicking, a tutor who knows the subject can walk you through it one-on-one. That's different from advising or counseling.",
  },
  {
    id: "s2",
    situation:
      "You're not sure if you're enrolled in the right classes for your major and you don't understand what DARS is showing you.",
    correctAnswer: "advising",
    options: [
      { id: "tutoring", label: "Tutoring Center", icon: "📚" },
      { id: "advising", label: "Academic Advising", icon: "🗺️" },
      { id: "office-hours", label: "Office Hours", icon: "🎓" },
      { id: "financial", label: "Financial Coaching", icon: "💰" },
    ],
    explanation:
      "Academic advisors help you read your DARS, plan your course sequence, and make sure you're on track to graduate. This is literally their job.",
  },
  {
    id: "s3",
    situation:
      "Your meal plan ran out early, textbooks cost more than expected, and you're skipping meals to stretch your budget.",
    correctAnswer: "financial",
    options: [
      { id: "tutoring", label: "Tutoring Center", icon: "📚" },
      { id: "counseling", label: "Counseling Services", icon: "💚" },
      { id: "financial", label: "Financial Coaching", icon: "💰" },
      { id: "office-hours", label: "Office Hours", icon: "🎓" },
    ],
    explanation:
      "Financial coaches help you build a realistic budget and find emergency funds, grants, or food assistance you didn't know existed.",
  },
  {
    id: "s4",
    situation:
      "You've been sleeping badly, feeling overwhelmed by everything, and starting to wonder if college was the right choice.",
    correctAnswer: "counseling",
    options: [
      { id: "advising", label: "Academic Advising", icon: "🗺️" },
      { id: "counseling", label: "Counseling Services", icon: "💚" },
      { id: "tutoring", label: "Tutoring Center", icon: "📚" },
      { id: "financial", label: "Financial Coaching", icon: "💰" },
    ],
    explanation:
      "Counseling services aren't just for crises. You can walk in and talk about stress, sleep, or feeling out of place.",
  },
  {
    id: "s5",
    situation:
      "You understood the lecture but the homework asks you to apply concepts in a way the professor didn't cover. You want to ask but class has 300 people.",
    correctAnswer: "office-hours",
    options: [
      { id: "office-hours", label: "Office Hours", icon: "🎓" },
      { id: "tutoring", label: "Tutoring Center", icon: "📚" },
      { id: "advising", label: "Academic Advising", icon: "🗺️" },
      { id: "counseling", label: "Counseling Services", icon: "💚" },
    ],
    explanation:
      "Office hours exist for exactly this. You don't need a big question. Any honest starting point is fine.",
  },
];

export default function ResourceMatchQuiz({
  onComplete,
  sound,
  onInteract,
}: {
  onComplete: () => void;
  sound: SoundEngineControls;
  onInteract?: () => void;
}) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [disabledWrongIds, setDisabledWrongIds] = useState<string[]>([]);
  const [selectedCorrectId, setSelectedCorrectId] = useState<string | null>(null);
  const advanceTimeoutRef = useRef<number | null>(null);

  const currentScenario = scenarios[scenarioIndex];
  const done = scenarioIndex >= scenarios.length;

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        window.clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  const resultSummary = useMemo(() => {
    if (!done) return null;
    return `You matched ${correctCount}/${scenarios.length} resources correctly.`;
  }, [correctCount, done]);

  function handleOption(optionId: string) {
    onInteract?.();
    if (!currentScenario || selectedCorrectId) return;

    if (optionId === currentScenario.correctAnswer) {
      sound.correct();
      setSelectedCorrectId(optionId);
      setCorrectCount((current) => current + 1);
      advanceTimeoutRef.current = window.setTimeout(() => {
        setScenarioIndex((current) => current + 1);
        setSelectedCorrectId(null);
        setDisabledWrongIds([]);
      }, 1800);
      return;
    }

    sound.wrong();
    setDisabledWrongIds((current) => Array.from(new Set([...current, optionId])));
  }

  return (
    <MiniGameShell
      title="RESOURCE MATCH"
      instructions="Read each scenario and pick the campus resource that fits best."
      icon="🎯"
      score={{ correct: correctCount, total: scenarios.length }}
      completed={done}
      onComplete={onComplete}
    >
      {done || !currentScenario ? (
        <div className="sketch-results-card">
          <strong>{resultSummary}</strong>
          <p>
            The point is not perfection. It is learning which door fits which kind of problem before a real week gets loud.
          </p>
        </div>
      ) : (
        <div className="sketch-resource-quiz">
          <article className="sketch-scenario-card">
            <p className="sketch-mini-eyebrow">
              Scenario {scenarioIndex + 1} of {scenarios.length}
            </p>
            <p>{currentScenario.situation}</p>
          </article>

          <div className="sketch-option-grid">
            {currentScenario.options.map((option) => {
              const isDisabled = disabledWrongIds.includes(option.id);
              const isCorrect = selectedCorrectId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`sketch-option-card ${isCorrect ? "is-correct" : ""} ${
                    isDisabled ? "is-disabled" : ""
                  }`}
                  disabled={isDisabled || Boolean(selectedCorrectId)}
                  onClick={() => handleOption(option.id)}
                >
                  <span>{option.icon}</span>
                  <strong>{option.label}</strong>
                  {isCorrect ? <span>✓</span> : null}
                </button>
              );
            })}
          </div>

          {selectedCorrectId ? (
            <article className="sketch-explanation-card">
              <strong>Explanation</strong>
              <p>{currentScenario.explanation}</p>
            </article>
          ) : null}
        </div>
      )}
    </MiniGameShell>
  );
}
