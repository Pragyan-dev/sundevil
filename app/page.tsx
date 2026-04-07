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
      eyebrow: "Narrative game",
      title: "See What It's Like",
      description:
        "Play through your first week at ASU with class-room previews, advising, office hours, and MyASU task walkthroughs.",
      href: "/simulate",
      label: "Play your first week",
    },
    {
      eyebrow: "Spatial explorer",
      title: "Explore Campus",
      description:
        "Walk a sketch-style Tempe map, step up to real buildings, and see what tutoring, advising, counseling, and DARS feel like before you need them.",
      href: "/campus",
      label: "Open campus map",
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
        <section className="relative overflow-hidden rounded-[2rem] border border-[rgba(0,0,0,0.08)] bg-[#1a1a1a] shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/videos/story/posters/advising-center.svg"
          >
            <source src="/videos/story/student-advising-session.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.76),rgba(0,0,0,0.4)_55%,rgba(0,0,0,0.32))]" />

          <div className="relative z-10 flex min-h-[34rem] flex-col justify-end px-6 py-8 sm:px-10 sm:py-10 lg:min-h-[41rem] lg:px-14 lg:py-14">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-white/72">
              ASU-style support experience
            </p>
            <h1 className="mt-5 max-w-5xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.96] text-white sm:text-6xl lg:text-7xl">
              Your first week at ASU should feel clearer before it starts.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/86">
              SunDevilConnect is a first-gen support demo built around the same visual language you
              already see on ASU pages, but rewritten in plain language: where to go, what the room
              looks like, what to click, and what usually happens next.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/simulate" className="button-gold">
                Play your first week
              </Link>
              <Link href="/campus" className="button-ghost-light">
                Explore campus
              </Link>
              <Link href="/finder" className="button-ghost-light">
                Find support now
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.92fr_1.05fr_0.9fr]">
          <article className="paper-card">
            <p className="eyebrow">Built for first-gen students</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#191919]">
              No jargon. No shame spiral.
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--ink)]/82">
              Instead of assuming you already know what DARS, office hours, advising, or MyASU
              means, the app makes each one concrete before you try it in real life.
            </p>
          </article>

          <article className="paper-card paper-card-featured">
            <p className="eyebrow">What this covers</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="pill">Classroom navigation</div>
              <div className="pill">Advising</div>
              <div className="pill">Canvas and syllabi</div>
              <div className="pill">Office hours</div>
              <div className="pill">MyASU tasks</div>
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--ink)]/74">
              The narrative route stays focused on first-week friction points that often feel small
              from the outside but overwhelming when it is your first time.
            </p>
          </article>

          <article className="paper-card">
            <p className="eyebrow">Faculty side</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#191919]">
              Early support signals, not surveillance.
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--ink)]/82">
              The faculty dashboard shows who may still be unsure about advising, office hours or
              class navigation, plus warmer personalized check-ins that match the actual barrier.
            </p>
            <Link href="/dashboard" className="button-primary mt-6">
              Open faculty console
            </Link>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {featureCards.map((card) => (
            <ResourceCard
              key={card.title}
              eyebrow={card.eyebrow}
              title={card.title}
              description={card.description}
              detail={
                card.title === "Chat With Us"
                  ? "This route is the one real external integration in the project."
                  : undefined
              }
              featured={card.title === "Find Resources"}
              links={[{ href: card.href, label: card.label }]}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
