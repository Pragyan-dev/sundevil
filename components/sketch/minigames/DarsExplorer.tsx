"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { SoundEngineControls } from "@/components/sketch/SoundEngine";
import MiniGameShell from "@/components/sketch/minigames/MiniGameShell";

const INITIAL_TIME = 60;

const mockDars = {
  student: "Alex",
  major: "Computer Science (BS)",
  totalCreditsNeeded: 120,
  creditsCompleted: 0,
  sections: [
    {
      name: "General Studies",
      status: "In Progress",
      courses: [
        { code: "ENG 101", name: "First-Year Composition", credits: 3, status: "enrolled" },
        { code: "MAT 265", name: "Calculus for Engineers I", credits: 3, status: "enrolled" },
        { code: "ASU 101", name: "The ASU Experience", credits: 1, status: "enrolled" },
      ],
    },
    {
      name: "Major Requirements",
      status: "Not Started",
      courses: [
        {
          code: "CSE 110",
          name: "Principles of Programming",
          credits: 3,
          status: "needed",
          note: "Next up",
        },
        {
          code: "CSE 205",
          name: "Object-Oriented Programming",
          credits: 3,
          status: "needed",
          prerequisite: "Blocked until CSE 110 is complete",
        },
        { code: "CSE 230", name: "Computer Organization", credits: 3, status: "needed" },
      ],
    },
    {
      name: "Upper Division Electives",
      status: "Not Started",
      courses: [
        { code: "CSE 3XX", name: "Elective 1", credits: 3, status: "needed" },
        { code: "CSE 3XX", name: "Elective 2", credits: 3, status: "needed" },
      ],
    },
  ],
};

const tasks = [
  {
    id: "credits",
    label: "Find the total credits you need to graduate",
    clue: "Look for the big number in the header stats.",
    hotspot: "credits-needed",
  },
  {
    id: "math",
    label: "Find the math class you are enrolled in right now",
    clue: "It should be in your current schedule, not the future plan.",
    hotspot: "course-mat-265",
  },
  {
    id: "next-major",
    label: "Find the first major class you still need",
    clue: "Scan major requirements for the class marked next up.",
    hotspot: "course-cse-110",
  },
  {
    id: "blocking",
    label: "Find the class blocking next semester",
    clue: "Look for a prerequisite note buried inside the major sequence.",
    hotspot: "prereq-cse-110",
  },
] as const;

type TaskId = (typeof tasks)[number]["id"];

function formatTime(timeLeft: number) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function DarsExplorer({
  onComplete,
  sound,
  onInteract,
}: {
  onComplete: () => void;
  sound: SoundEngineControls;
  onInteract?: () => void;
}) {
  const [foundTaskIds, setFoundTaskIds] = useState<TaskId[]>([]);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [recentTaskId, setRecentTaskId] = useState<TaskId | null>(null);
  const [recentHotspot, setRecentHotspot] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  const done = foundTaskIds.length === tasks.length;
  const remaining = tasks.length - foundTaskIds.length;

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!hasStarted || hasFailed || done) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setHasFailed(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [done, hasFailed, hasStarted]);

  const summaryText = useMemo(() => {
    if (done) {
      return "You found every clue before the clock ran out. DARS is not magic. It is just a map with labels.";
    }

    if (hasFailed) {
      return "Time ran out. Reset the hunt, scan the document again, and catch the clues before the countdown hits zero.";
    }

    if (!hasStarted) {
      return "The clock starts on your first tap. Scan the document first, then go hunting.";
    }

    if (timeLeft <= 10) {
      return "Final seconds. Lock in the last clue before the timer expires.";
    }

    return `${remaining} clue${remaining === 1 ? "" : "s"} left. Read the document like a detective, not like a panic scroll.`;
  }, [done, hasFailed, hasStarted, remaining, timeLeft]);

  function queueTimeout(callback: () => void, delay: number) {
    const timeoutId = window.setTimeout(callback, delay);
    timeoutsRef.current.push(timeoutId);
  }

  function clearRoundState() {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutsRef.current = [];
    setFoundTaskIds([]);
    setWrongKey(null);
    setRecentTaskId(null);
    setRecentHotspot(null);
    setTimeLeft(INITIAL_TIME);
    setHasStarted(false);
    setHasFailed(false);
  }

  function handleTap(hotspot: string, key: string) {
    onInteract?.();

    if (hasFailed || done || timeLeft === 0) {
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);
    }

    const task = tasks.find((item) => item.hotspot === hotspot);

    if (task && !foundTaskIds.includes(task.id)) {
      sound.correct();
      setFoundTaskIds((current) => [...current, task.id]);
      setRecentTaskId(task.id);
      setRecentHotspot(key);
      setWrongKey(null);

      queueTimeout(() => {
        setRecentTaskId((current) => (current === task.id ? null : current));
      }, 900);

      queueTimeout(() => {
        setRecentHotspot((current) => (current === key ? null : current));
      }, 950);

      return;
    }

    if (task && foundTaskIds.includes(task.id)) {
      return;
    }

    sound.wrong();
    setWrongKey(key);
    queueTimeout(() => {
      setWrongKey((current) => (current === key ? null : current));
    }, 550);
  }

  return (
    <MiniGameShell
      title="DARS EXPLORER"
      instructions="Turn the DARS report into a scavenger hunt. Find all four clues before the countdown hits zero."
      icon="🗺️"
      score={{ correct: foundTaskIds.length, total: tasks.length }}
      completed={done}
      onComplete={onComplete}
    >
      <div className="sketch-dars-hunt">
        <div className="sketch-dars-grid">
          <div className="sketch-dars-panel">
            <div className="sketch-dars-header">
              <div className="sketch-dars-identity-grid">
                <article className="sketch-dars-info-card">
                  <p className="sketch-mini-eyebrow">Student</p>
                  <strong>{mockDars.student}</strong>
                  <span>Mock DARS report</span>
                </article>

                <article className="sketch-dars-info-card">
                  <p className="sketch-mini-eyebrow">Major</p>
                  <strong>{mockDars.major}</strong>
                  <span>Read what is done, what is next, and what is blocked.</span>
                </article>
              </div>

              <div className="sketch-dars-stat-grid">
                <button
                  type="button"
                  className={`sketch-dars-stat sketch-dars-clickable sketch-dars-hotspot-card is-relevant ${
                    wrongKey === "credits-needed" ? "is-wrong" : ""
                  } ${foundTaskIds.includes("credits") ? "is-found" : ""} ${
                    recentHotspot === "credits-needed" ? "is-just-found" : ""
                  }`}
                  onClick={() => handleTap("credits-needed", "credits-needed")}
                >
                  <span className="sketch-mini-eyebrow">Graduation target</span>
                  <p>Total credits needed</p>
                  <strong>{mockDars.totalCreditsNeeded}</strong>
                  {foundTaskIds.includes("credits") ? (
                    <span className="sketch-dars-found-stamp">FOUND IT</span>
                  ) : null}
                </button>

                <button
                  type="button"
                  className={`sketch-dars-stat sketch-dars-clickable ${
                    wrongKey === "credits-completed" ? "is-wrong" : ""
                  }`}
                  onClick={() => handleTap("credits-completed", "credits-completed")}
                >
                  <span className="sketch-mini-eyebrow">Completed now</span>
                  <p>Credits completed</p>
                  <strong>{mockDars.creditsCompleted}</strong>
                </button>
              </div>
            </div>

            {mockDars.sections.map((section) => (
              <div key={section.name} className="sketch-dars-section">
                <div className="sketch-dars-section-heading">
                  <strong>{section.name}</strong>
                  <span>{section.status}</span>
                </div>

                <div className="sketch-dars-rows">
                  {section.courses.map((course, courseIndex) => {
                    const rowHotspot =
                      course.code === "MAT 265"
                        ? "course-mat-265"
                        : course.code === "CSE 110"
                          ? "course-cse-110"
                          : `${section.name}-${course.code}-${courseIndex}`;
                    const rowKey = `row-${section.name}-${course.code}-${course.name}-${courseIndex}`;
                    const rowFound =
                      (rowHotspot === "course-mat-265" && foundTaskIds.includes("math")) ||
                      (rowHotspot === "course-cse-110" && foundTaskIds.includes("next-major"));
                    const rowRelevant =
                      rowHotspot === "course-mat-265" || rowHotspot === "course-cse-110";

                    return (
                      <article key={rowKey} className="sketch-dars-row-stack">
                        <button
                          type="button"
                          className={`sketch-dars-row sketch-dars-clickable ${
                            rowRelevant ? "is-relevant" : ""
                          } ${wrongKey === rowKey ? "is-wrong" : ""} ${rowFound ? "is-found" : ""} ${
                            recentHotspot === rowKey ? "is-just-found" : ""
                          }`}
                          onClick={() => handleTap(rowHotspot, rowKey)}
                        >
                          <div className="sketch-dars-row-top">
                            <strong>{course.code}</strong>
                            <span className={`sketch-dars-status-pill is-${course.status}`}>{course.status}</span>
                          </div>
                          <p>{course.name}</p>
                          <div className="sketch-dars-row-meta">
                            <span>{course.credits} credits</span>
                            {course.note ? <span className="sketch-dars-inline-note">{course.note}</span> : null}
                          </div>
                          {rowFound ? <span className="sketch-dars-found-stamp">FOUND IT</span> : null}
                        </button>

                        {course.prerequisite ? (
                          <button
                            type="button"
                            className={`sketch-dars-prereq-button sketch-dars-clickable is-relevant ${
                              wrongKey === "prereq-cse-110" ? "is-wrong" : ""
                            } ${foundTaskIds.includes("blocking") ? "is-found" : ""} ${
                              recentHotspot === "prereq-cse-110" ? "is-just-found" : ""
                            }`}
                            onClick={() => handleTap("prereq-cse-110", "prereq-cse-110")}
                          >
                            <span className="sketch-mini-eyebrow">Prerequisite note</span>
                            <strong>{course.prerequisite}</strong>
                            {foundTaskIds.includes("blocking") ? (
                              <span className="sketch-dars-found-stamp">FOUND IT</span>
                            ) : null}
                          </button>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="sketch-task-list-panel sketch-dars-hunt-board">
            <div className="sketch-dars-hunt-header">
              <div>
                <p className="sketch-mini-eyebrow">Scavenger hunt</p>
                <strong>Find all four clues</strong>
                <span>Scan the document before the clock burns down.</span>
              </div>

              <div className={`sketch-dars-timer-pill ${hasStarted ? "is-live" : ""} ${timeLeft <= 10 && hasStarted && !done ? "is-critical" : ""}`}>
                <span className="sketch-mini-eyebrow">Countdown</span>
                <strong>{formatTime(timeLeft)}</strong>
                <small>{hasStarted ? "Live" : "Starts on first tap"}</small>
              </div>
            </div>

            <div className="sketch-task-sidebar-header">
              <div>
                <p className="sketch-mini-eyebrow">Hunt board</p>
                <strong>Sticky note clues</strong>
              </div>
              <span className="sketch-task-progress-pill">
                {foundTaskIds.length}/{tasks.length}
              </span>
            </div>

            <div className="sketch-dars-sticky-grid">
              {tasks.map((task, index) => {
                const isFound = foundTaskIds.includes(task.id);
                const isFresh = recentTaskId === task.id;

                return (
                  <article
                    key={task.id}
                    className={`sketch-dars-sticky-note ${isFound ? "is-complete" : ""} ${
                      isFresh ? "is-just-found" : ""
                    }`}
                    style={{ ["--sticky-tilt" as string]: `${index % 2 === 0 ? -2.5 + index : 1.5 + index * 0.4}deg` }}
                  >
                    <div className="sketch-dars-sticky-pin" aria-hidden="true" />
                    <p className="sketch-mini-eyebrow">{isFound ? "Locked in" : `Clue ${index + 1}`}</p>
                    <strong>{task.label}</strong>
                    <span>{task.clue}</span>
                    {isFound ? <em className="sketch-dars-sticky-caption">Locked in</em> : null}
                    {isFound ? <span className="sketch-dars-found-stamp">FOUND IT</span> : null}
                  </article>
                );
              })}
            </div>

            <p className={`sketch-dars-summary ${hasFailed ? "is-failed" : ""} ${done ? "is-complete" : ""}`}>
              {summaryText}
            </p>
          </aside>
        </div>

        {hasFailed ? (
          <div className="sketch-dars-fail-overlay">
            <article className="sketch-dars-fail-card">
              <p className="sketch-mini-eyebrow">Time up</p>
              <strong>The hunt beat you this round.</strong>
              <span>
                Reset the board, scan the document again, and try to catch all four clues before the
                timer expires.
              </span>
              <button
                type="button"
                className="sketch-action-button sketch-action-button-gold"
                onClick={clearRoundState}
              >
                Try Again
              </button>
            </article>
          </div>
        ) : null}
      </div>
    </MiniGameShell>
  );
}
