import Link from "next/link";

export function RoleSelector() {
  return (
    <section className="page-shell py-12">
      <div className="mx-auto max-w-6xl">
        <div className="paper-card overflow-hidden rounded-[2.4rem] border border-[rgba(140,29,64,0.12)] bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(255,248,236,0.92))] p-8 sm:p-10">
          <p className="eyebrow">ASU Unlocked</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)] sm:text-5xl">
            Support Dashboard
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted-ink)]">
            Pick the role you want to demo. Faculty sees course-level signals and outreach actions.
            Advisors see cross-course context, flagged students, and institutional support gaps.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <RoleCard
              href="/dashboard/faculty"
              icon="🎓"
              title="Faculty"
              body="View students in your course, scan the class quickly, write personalized outreach, and attach async advisor flags when the issue goes beyond the classroom."
            />
            <RoleCard
              href="/dashboard/advisor"
              icon="🗺️"
              title="Advisor"
              body="View assigned students across all courses, triage flagged students on your own time, spot DARS and support gaps, and use shared threads only for follow-up."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleCard({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[2rem] border border-[rgba(140,29,64,0.14)] bg-white/82 p-7 shadow-[0_20px_45px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-4xl" aria-hidden="true">
          {icon}
        </span>
        <span className="pill">Enter</span>
      </div>
      <h2 className="mt-8 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-[var(--muted-ink)]">{body}</p>
      <span className="mt-8 inline-flex items-center text-sm font-semibold text-[var(--asu-maroon)]">
        Open {title} view →
      </span>
    </Link>
  );
}
