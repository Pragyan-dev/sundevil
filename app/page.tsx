import Link from "next/link";

import { ResourceCard } from "@/components/ResourceCard";

export default function Home() {
  const featureCards = [
    {
      eyebrow: "One-tap finder",
      title: "Find Resources",
      description:
        "Answer three quick questions and get a shortlist of ASU support options with plain-language explanations.",
      href: "/finder",
      label: "Open finder",
    },
    {
      eyebrow: "Interactive walkthroughs",
      title: "See What It's Like",
      description:
        "Preview tutoring, advising, and first support visits so the first step feels less abstract.",
      href: "/simulate",
      label: "Explore simulations",
    },
    {
      eyebrow: "Live feature",
      title: "Chat With Us",
      description:
        "Ask SunDevil Guide what to do next and get a short, grounded answer tied to the local ASU resource data.",
      href: "/chat",
      label: "Open chat",
    },
    {
      eyebrow: "Money search",
      title: "Check Scholarships",
      description:
        "Filter a curated scholarship set by year, major, GPA, first-gen status, residency, and financial aid status.",
      href: "/scholarships",
      label: "Check matches",
    },
  ];

  return (
    <div className="page-shell pb-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="maroon-panel relative overflow-hidden">
            <Link
              href="/dashboard"
              className="absolute right-6 top-6 rounded-full border border-[rgba(255,198,39,0.28)] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[var(--asu-gold)] transition hover:bg-[rgba(255,255,255,0.08)]"
            >
              Faculty Dashboard
            </Link>

            <p className="eyebrow text-[var(--asu-gold)]">ASU support, explained clearly</p>
            <h1 className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-5xl leading-[1.02] text-[var(--warm-white)] sm:text-6xl lg:text-7xl">
              Your first step doesn&apos;t have to be scary.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[rgba(255,251,245,0.84)]">
              SunDevilConnect makes campus support feel legible before you ever walk in the room:
              what it does, what to click, and what to expect when you show up.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/finder" className="button-gold">
                Start with the finder
              </Link>
              <Link href="/chat" className="button-ghost-light">
                Ask SunDevil Guide
              </Link>
            </div>
          </div>

          <aside className="grid gap-5">
            <div className="paper-card">
              <p className="eyebrow">Built for first-gen students</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                No jargon. No shame spiral.
              </h2>
              <p className="mt-4 text-base leading-7 text-[var(--ink)]/82">
                The static pages make the demo feel concrete. The chat is the only live feature and
                uses the same local ASU data the rest of the site is built from.
              </p>
            </div>

            <div className="paper-card paper-card-featured">
              <p className="eyebrow">What this covers</p>
              <div className="mt-4 grid gap-3">
                <div className="pill">Tutoring</div>
                <div className="pill">Advising</div>
                <div className="pill">Counseling</div>
                <div className="pill">Financial aid</div>
                <div className="pill">Scholarships</div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((card, index) => (
            <ResourceCard
              key={card.title}
              eyebrow={card.eyebrow}
              title={card.title}
              description={card.description}
              detail={index === 2 ? "This route is the one real external integration in the project." : undefined}
              featured={index === 0}
              links={[{ href: card.href, label: card.label }]}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
