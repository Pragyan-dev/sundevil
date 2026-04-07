import { getAdvisorAssessment, getAdvisorRecommendations, getRecommendedResource } from "@/lib/dashboard";
import type { DashboardStudent } from "@/lib/types";

export function RecommendationEngine({ student }: { student: DashboardStudent }) {
  const recommendations = getAdvisorRecommendations(student);

  return (
    <section className="paper-card">
      <p className="eyebrow">Advisor assessment</p>
      <div className="mt-5 rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.78)] p-5 text-sm leading-7 text-[var(--ink)]/84">
        {getAdvisorAssessment(student)}
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted-ink)]">
          Recommended actions
        </p>
        <div className="mt-4 space-y-4">
          {recommendations.map((recommendation, index) => {
            const resource = recommendation.resourceSlug
              ? getRecommendedResource({ ...student, recommendedResource: { type: recommendation.resourceSlug, reason: recommendation.reason } })
              : undefined;

            return (
              <article
                key={recommendation.id}
                className="rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.78)] p-5"
              >
                <p className="text-sm font-semibold text-[var(--asu-maroon)]">
                  {index + 1}. {recommendation.icon} {recommendation.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">{recommendation.reason}</p>
                {resource ? (
                  <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">
                    {resource.name}: {resource.location} · {resource.hours}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
