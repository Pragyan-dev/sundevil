import type { AdvisorAlert } from "@/lib/dashboard";

const toneStyles = {
  high: "border-[#C62828]/14 bg-[#C62828]/7 text-[#8B1E1E]",
  watch: "border-[#F57F17]/18 bg-[#F57F17]/8 text-[#8A4B00]",
} as const;

export function AdvisorAlerts({ alerts }: { alerts: AdvisorAlert[] }) {
  return (
    <section className="paper-card">
      <p className="eyebrow">Alerts</p>
      <div className="mt-5 grid gap-3">
        {alerts.map((alert) => (
          <article
            key={alert.id}
            className={`rounded-[1.35rem] border px-4 py-3 text-sm leading-7 ${toneStyles[alert.tone]}`}
          >
            <span className="mr-2">{alert.icon}</span>
            {alert.text}
          </article>
        ))}
      </div>
    </section>
  );
}
