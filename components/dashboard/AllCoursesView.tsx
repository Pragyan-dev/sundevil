import type { DashboardStudent } from "@/lib/types";

export function AllCoursesView({ student }: { student: DashboardStudent }) {
  return (
    <section className="paper-card">
      <p className="eyebrow">Current courses</p>
      <div className="mt-5 space-y-4">
        {student.allCourses.map((course) => (
          <article
            key={course.code}
            className="rounded-[1.35rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.78)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[var(--asu-maroon)]">{course.code}</h3>
              <span className="pill">{course.status}</span>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">{course.professorName}</p>
            {course.facultySignals.length ? (
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]/84">
                {course.facultySignals.map((signal) => (
                  <li key={signal}>• {signal}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">No faculty signals logged.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
