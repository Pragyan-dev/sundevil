import type { FacultySignal } from "@/lib/dashboard";

interface FacultySignalsProps {
  signals: FacultySignal[];
}

const toneStyles = {
  high: "border-[#C62828]/14 bg-[#C62828]/7 text-[#8B1E1E]",
  medium: "border-[rgba(140,29,64,0.12)] bg-[rgba(140,29,64,0.04)] text-[var(--asu-maroon)]",
  positive: "border-[#2E7D32]/14 bg-[#2E7D32]/7 text-[#1E5A24]",
} as const;

export function FacultySignals({ signals }: FacultySignalsProps) {
  return (
    <section className="paper-card">
      <p className="eyebrow">This week&apos;s signals</p>
      <div className="mt-5 grid gap-3">
        {signals.map((signal) => (
          <article
            key={signal.id}
            className={`rounded-[1.35rem] border px-4 py-3 text-sm leading-7 ${toneStyles[signal.tone]}`}
          >
            <span className="mr-2">{signal.icon}</span>
            {signal.text}
          </article>
        ))}
      </div>
    </section>
  );
}
