import { ResourceCard } from "@/components/ResourceCard";
import { simulationScenarios } from "@/lib/data";

export default function SimulateHubPage() {
  return (
    <div className="page-shell pb-24">
      <div className="mx-auto max-w-7xl">
        <section className="maroon-panel">
          <p className="eyebrow text-[var(--asu-gold)]">Simulation hub</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight text-[var(--warm-white)]">
            A preview is easier to say yes to than a mystery.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[rgba(255,251,245,0.82)]">
            These walkthroughs are linear, low-pressure previews that show the rhythm of a first
            visit before you decide to go.
          </p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {simulationScenarios.map((scenario) => (
            <ResourceCard
              key={scenario.slug}
              eyebrow="Interactive walkthrough"
              title={scenario.title}
              description={scenario.summary}
              detail={`${scenario.steps.length} steps`}
              featured={scenario.slug === "tutoring"}
              links={[{ href: `/simulate/${scenario.slug}`, label: "Start walkthrough" }]}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
