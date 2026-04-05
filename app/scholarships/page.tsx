import { ScholarshipMatcher } from "@/components/ScholarshipMatcher";

export default function ScholarshipsPage() {
  return (
    <div className="page-shell pb-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="maroon-panel">
          <p className="eyebrow text-[var(--asu-gold)]">Scholarship checker</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight text-[var(--warm-white)]">
            Filter the scholarship list by what is true for you.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[rgba(255,251,245,0.82)]">
            This is a local curated dataset, not a live scholarship portal. It is meant to make the
            demo useful and predictable.
          </p>
        </section>

        <section className="paper-card">
          <ScholarshipMatcher variant="page" />
        </section>
      </div>
    </div>
  );
}
