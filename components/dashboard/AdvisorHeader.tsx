interface AdvisorHeaderProps {
  name: string;
  subtitle: string;
}

export function AdvisorHeader({ name, subtitle }: AdvisorHeaderProps) {
  return (
    <section className="maroon-panel">
      <p className="eyebrow !text-[rgba(255,255,255,0.72)]">🗺️ Advisor view</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--warm-white)] sm:text-5xl">
        {name}
      </h1>
      <p className="mt-4 text-lg leading-8 text-[rgba(255,255,255,0.84)]">{subtitle}</p>
    </section>
  );
}
