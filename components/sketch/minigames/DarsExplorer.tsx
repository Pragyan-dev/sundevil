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
            <div>
              <p className="sketch-mini-eyebrow">Student</p>
              <strong>{mockDars.student}</strong>
            </div>
            <div>
              <p className="sketch-mini-eyebrow">Major</p>
              <strong>{mockDars.major}</strong>
            </div>
            <button
              type="button"
              className={`sketch-dars-stat ${wrongKey === "credits" ? "is-wrong" : ""}`}
              onClick={() => handleTap("credits", "credits")}
            >
              <span>Total credits needed</span>
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
                      className={`sketch-dars-row ${wrongKey === key ? "is-wrong" : ""}`}
                      onClick={() => handleTap(target ?? key, key)}
                    >
                      <span>{course.code}</span>
                      <span>{course.name}</span>
                      <span>{course.credits} cr</span>
                      <span>{course.status}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <aside className="sketch-task-list-panel">
          <p className="sketch-mini-eyebrow">Checklist</p>
          <div className="sketch-task-list">
            {tasks.map((task) => (
              <article
                key={task.id}
                className={`sketch-task-item ${completedTasks.includes(task.id) ? "is-complete" : ""}`}
              >
                <span>{completedTasks.includes(task.id) ? "✓" : "○"}</span>
                <p>{task.label}</p>
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
