"use client";

import { useMemo, useState } from "react";

import type { SoundEngineControls } from "@/components/sketch/SoundEngine";
import MiniGameShell from "@/components/sketch/minigames/MiniGameShell";

const pairs = [
  {
    id: "dars",
    term: "DARS",
    definition: "A report showing every class you need to graduate and what you've completed",
  },
  {
    id: "hold",
    term: "Hold",
    definition: "A block on your account that prevents enrollment until you complete a task",
  },
  {
    id: "office-hours",
    term: "Office Hours",
    definition: "Weekly time when the professor sits in their office specifically for student questions",
  },
  {
    id: "bursar",
    term: "Bursar",
    definition: "The office that handles tuition bills, payment plans, and refunds",
  },
  {
    id: "syllabus",
    term: "Syllabus",
    definition: "The document with grading rules, assignment dates, and course policies",
  },
  {
    id: "prerequisite",
    term: "Prerequisite",
    definition: "A class you must pass before you're allowed to enroll in a more advanced one",
  },
];

const definitionOrder = [3, 0, 5, 1, 4, 2];

export default function CampusJargonMatch({
  onComplete,
  sound,
  onInteract,
}: {
  onComplete: () => void;
  sound: SoundEngineControls;
  onInteract?: () => void;
}) {
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongCombo, setWrongCombo] = useState<string | null>(null);

  const definitions = useMemo(() => definitionOrder.map((index) => pairs[index]), []);
  const done = matchedIds.length === pairs.length;
  const selectedTerm = selectedTermId ? pairs.find((pair) => pair.id === selectedTermId) ?? null : null;

  function handleTermTap(termId: string) {
    onInteract?.();
    if (matchedIds.includes(termId)) return;
    setSelectedTermId(termId);
  }

  function handleDefinitionTap(definitionId: string) {
    onInteract?.();
    if (!selectedTermId || matchedIds.includes(definitionId)) return;

    if (selectedTermId === definitionId) {
      sound.correct();
      setMatchedIds((current) => [...current, definitionId]);
      setSelectedTermId(null);
      setWrongCombo(null);
      return;
    }

    sound.wrong();
    const wrongId = `${selectedTermId}:${definitionId}`;
    setWrongCombo(wrongId);
    setSelectedTermId(null);
    window.setTimeout(() => {
      setWrongCombo((current) => (current === wrongId ? null : current));
    }, 500);
  }

  return (
    <MiniGameShell
      title="CAMPUS JARGON"
      instructions="Match each ASU term to its plain-English meaning."
      icon="📖"
      score={{ correct: matchedIds.length, total: pairs.length }}
      completed={done}
      onComplete={onComplete}
    >
      <article className={`sketch-jargon-summary-card ${selectedTerm ? "is-active" : ""} ${done ? "is-complete" : ""}`}>
        <p className="sketch-mini-eyebrow">{done ? "Completed" : "How it works"}</p>
        <strong>
          {done
            ? "You translated the jargon."
            : selectedTerm
              ? `Now match “${selectedTerm.term}” to its meaning.`
              : "Tap a term first, then tap the definition that actually matches it."}
        </strong>
        <span>
          {done
            ? "That is the point: once the words have plain-English meaning, they stop feeling like secret college language."
            : "Wrong matches are fine. This is the place to learn the words before they show up in real emails and portals."}
        </span>
      </article>

      <div className="sketch-jargon-board">
        <article className="sketch-jargon-panel">
          <div className="sketch-jargon-panel-header">
            <div>
              <p className="sketch-mini-eyebrow">Terms</p>
              <strong>ASU words you will actually see</strong>
            </div>
            <span className="sketch-jargon-count-pill">{matchedIds.length}/{pairs.length}</span>
          </div>
          <div className="sketch-jargon-column">
            {pairs.map((pair) => (
              <button
                key={pair.id}
                type="button"
                className={`sketch-jargon-card ${
                  selectedTermId === pair.id ? "is-selected" : ""
                } ${matchedIds.includes(pair.id) ? "is-matched" : ""}`}
                onClick={() => handleTermTap(pair.id)}
              >
                <strong>{pair.term}</strong>
                <span>
                  {matchedIds.includes(pair.id)
                    ? "Matched"
                    : selectedTermId === pair.id
                      ? "Selected"
                      : "Tap to choose"}
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="sketch-jargon-panel">
          <div className="sketch-jargon-panel-header">
            <div>
              <p className="sketch-mini-eyebrow">Definitions</p>
              <strong>Plain-English meaning</strong>
            </div>
          </div>
          <div className="sketch-jargon-column">
            {definitions.map((pair) => (
              <button
                key={`${pair.id}-definition`}
                type="button"
                className={`sketch-jargon-card sketch-jargon-definition ${
                  matchedIds.includes(pair.id) ? "is-matched" : ""
                } ${
                  wrongCombo?.endsWith(pair.id)
                    ? "is-wrong"
                    : ""
                }`}
                onClick={() => handleDefinitionTap(pair.id)}
              >
                <p>{pair.definition}</p>
              </button>
            ))}
          </div>
        </article>
      </div>

      <p className="sketch-jargon-status">
        {done
          ? "Matched. These words stop sounding like secret college language once they connect to something concrete."
          : `Matched: ${matchedIds.length}/${pairs.length}`}
      </p>
    </MiniGameShell>
  );
}
