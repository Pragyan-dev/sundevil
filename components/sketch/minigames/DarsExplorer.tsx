"use client";

import { useMemo, useState } from "react";

import type { SoundEngineControls } from "@/components/sketch/SoundEngine";
import MiniGameShell from "@/components/sketch/minigames/MiniGameShell";

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
        { code: "CSE 110", name: "Principles of Programming", credits: 3, status: "needed" },
        { code: "CSE 205", name: "Object-Oriented Programming", credits: 3, status: "needed" },
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
  { id: "credits", label: "Find how many total credits you need to graduate", target: "credits" },
  { id: "math", label: "Find the math class you're currently enrolled in", target: "MAT 265" },
  { id: "next-major", label: "Find a class you'll need to take next semester for your major", target: "needed-major" },
] as const;

export default function DarsExplorer({
  onComplete,
  sound,
  onInteract,
}: {
  onComplete: () => void;
  sound: SoundEngineControls;
  onInteract?: () => void;
}) {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [wrongKey, setWrongKey] = useState<string | null>(null);

  const done = completedTasks.length === tasks.length;
  const currentTask = useMemo(
    () => tasks.find((task) => !completedTasks.includes(task.id)) ?? null,
    [completedTasks],
  );
  const currentTaskIndex = currentTask ? tasks.findIndex((task) => task.id === currentTask.id) : -1;

  function handleTap(target: string, key: string) {
    onInteract?.();

    if (
      (target === "credits" && currentTask?.target === "credits") ||
      (target === "MAT 265" && currentTask?.target === "MAT 265") ||
      (target === "needed-major" && currentTask?.target === "needed-major")
    ) {
      sound.correct();
      setCompletedTasks((current) =>
        currentTask ? Array.from(new Set([...current, currentTask.id])) : current,
      );
      setWrongKey(null);
      return;
    }

    sound.wrong();
    setWrongKey(key);
    window.setTimeout(() => {
      setWrongKey((current) => (current === key ? null : current));
    }, 550);
  }

  return (
    <MiniGameShell
      title="DARS EXPLORER"
      instructions="Tap the right part of this mock DARS to answer each question."
      icon="🗺️"
      score={{ correct: completedTasks.length, total: tasks.length }}
      completed={done}
      onComplete={onComplete}
    >
      <div className="sketch-dars-grid">
        <div className="sketch-dars-panel">
          <div className="sketch-dars-header">
            <div className="sketch-dars-identity-grid">
              <article className="sketch-dars-info-card">
                <p className="sketch-mini-eyebrow">Student</p>
                <strong>{mockDars.student}</strong>
                <span>First-week demo view</span>
              </article>

              <article className="sketch-dars-info-card">
                <p className="sketch-mini-eyebrow">Major</p>
                <strong>{mockDars.major}</strong>
                <span>Track the boxes, not the panic.</span>
              </article>
            </div>

            <button
              type="button"
              className={`sketch-dars-stat ${wrongKey === "credits" ? "is-wrong" : ""}`}
              onClick={() => handleTap("credits", "credits")}
            >
              <span className="sketch-mini-eyebrow">Graduation target</span>
              <p>Total credits needed</p>
              <strong>{mockDars.totalCreditsNeeded}</strong>
            </button>
          </div>

          {mockDars.sections.map((section) => (
            <div key={section.name} className="sketch-dars-section">
              <div className="sketch-dars-section-heading">
                <strong>{section.name}</strong>
                <span>{section.status}</span>
              </div>

              <div className="sketch-dars-rows">
                {section.courses.map((course, courseIndex) => {
                  const target =
                    course.code === "MAT 265"
                      ? "MAT 265"
                      : section.name === "Major Requirements" && course.status === "needed"
                        ? "needed-major"
                        : null;
                  const key = `${section.name}-${course.code}-${course.name}-${courseIndex}`;

                  return (
                    <button
                      key={key}
                      type="button"
                      className={`sketch-dars-row ${wrongKey === key ? "is-wrong" : ""} ${
                        currentTask?.target === target ? "is-current-target" : ""
                      }`}
                      onClick={() => handleTap(target ?? key, key)}
                    >
                      <div className="sketch-dars-row-top">
                        <strong>{course.code}</strong>
                        <span className={`sketch-dars-status-pill is-${course.status}`}>{course.status}</span>
                      </div>
                      <p>{course.name}</p>
                      <div className="sketch-dars-row-meta">
                        <span>{course.credits} credits</span>
                        {currentTask?.target === target ? <span className="sketch-dars-hotspot">Tap this</span> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <aside className="sketch-task-list-panel">
          <div className="sketch-task-sidebar-header">
            <div>
              <p className="sketch-mini-eyebrow">Checklist</p>
              <strong>What you are hunting for</strong>
            </div>
            <span className="sketch-task-progress-pill">
              {completedTasks.length}/{tasks.length}
            </span>
          </div>

          <article className={`sketch-current-task-card ${done ? "is-complete" : ""}`}>
            <p className="sketch-mini-eyebrow">{done ? "Completed" : `Current target ${currentTaskIndex + 1}/${tasks.length}`}</p>
            <strong>
              {done
                ? "You read the basics of a DARS report."
                : currentTask?.label}
            </strong>
            <span>
              {done
                ? "That is the whole point: find what is done, what is in progress, and what still needs a box checked."
                : "Tap the matching card or stat on the left."}
            </span>
          </article>

          <div className="sketch-task-list">
            {tasks.map((task, index) => (
              <article
                key={task.id}
                className={`sketch-task-item ${completedTasks.includes(task.id) ? "is-complete" : ""} ${
                  currentTask?.id === task.id ? "is-current" : ""
                }`}
              >
                <span className="sketch-task-bullet">{completedTasks.includes(task.id) ? "✓" : index + 1}</span>
                <div>
                  <strong>{task.label}</strong>
                  <p>
                    {task.target === "credits"
                      ? "Look for the big number in the header."
                      : task.target === "MAT 265"
                        ? "Find the enrolled math course."
                        : "Choose a course still marked needed in Major Requirements."}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <p className="sketch-dars-summary">
            {done
              ? "That's it. DARS shows you what you've done and what's left. You can access it anytime through My ASU."
              : currentTask?.label}
          </p>
        </aside>
      </div>
    </MiniGameShell>
  );
}
