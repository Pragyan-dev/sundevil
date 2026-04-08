import { formatTimestamp } from "@/lib/dashboard";
import type { SharedTimelineEvent } from "@/lib/types";

const iconMap: Record<SharedTimelineEvent["type"], string> = {
  email: "📧",
  "flag-created": "🚩",
  "flag-resolved": "✅",
  reply: "📝",
  note: "🗒️",
  resource: "📍",
  "check-in": "✋",
  milestone: "✅",
};

export function SharedTimeline({
  events,
  title = "Shared timeline",
}: {
  events: SharedTimelineEvent[];
  title?: string;
}) {
  return (
    <section className="paper-card">
      <p className="eyebrow">{title}</p>
      <div className="mt-5 space-y-4">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-[1.35rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--asu-maroon)]">
                <span className="mr-2">{iconMap[event.type]}</span>
                {event.actorName}
              </p>
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                {formatTimestamp(event.date)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">{event.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
