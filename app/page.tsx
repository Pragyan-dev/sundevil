import Link from "next/link";

export default function Home() {
  const featuredCard = {
    eyebrow: "One-tap finder",
    title: "Find Resources",
    description:
      "Answer three quick questions and get a shortlist of ASU support options with plain-language explanations.",
    href: "/finder",
    label: "Open finder",
    featuredNote: "Best first stop if you are not sure which office or tool you need yet.",
    tags: ["3 quick questions", "Real campus offices", "Plain-language summaries"],
  };

  const secondaryCards = [
    {
      eyebrow: "Narrative game",
      title: "See What It's Like",
      description:
        "Play through your first week at ASU with classroom previews, advising, office hours, and MyASU task walkthroughs.",
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
      detail: "This route is the one real external integration in the project.",
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

  const onboardingNotes = [
    {
      title: "Before you show up",
      description: "Preview the room, the vocabulary, and the first clicks before the real visit.",
    },
    {
      title: "When the system feels vague",
      description: "Turn DARS, holds, advising, and office hours into specific next steps.",
    },
  ];

  const coverageAreas = [
    {
      title: "Classroom navigation",
      detail: "finding rooms, reading the setup, understanding what happens first",
    },
    {
      title: "Advising",
      detail: "appointments, holds, DARS language, and where to start the conversation",
    },
    {
      title: "Canvas and syllabi",
      detail: "what to click, what matters now, and what can wait until later",
    },
    {
      title: "Office hours",
      detail: "how they work, what to bring, and how the interaction usually feels",
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

        <section className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
          <article className="paper-card relative overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,245,240,0.94))]">
            <div className="absolute right-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,198,39,0.24),rgba(255,198,39,0))]" />
            <div className="relative">
              <p className="eyebrow">Built for first-gen students</p>
              <h2 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold text-[#191919] sm:text-[3.2rem] sm:leading-[0.96]">
                No jargon. No shame spiral.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--ink)]/82">
                Instead of assuming you already know what DARS, office hours, advising, or MyASU
                means, the app turns each one into something you can picture before you try it in
                real life.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {onboardingNotes.map((note) => (
                  <div
                    key={note.title}
                    className="rounded-[1.4rem] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.72)] p-4"
                  >
                    <p className="text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[var(--asu-maroon)]">
                      {note.title}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
                      {note.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] xl:grid-cols-1">
            <article className="rounded-[2rem] border border-[rgba(255,198,39,0.42)] bg-[linear-gradient(180deg,rgba(255,250,236,0.9),rgba(255,255,255,0.96))] p-7 shadow-[0_22px_60px_rgba(121,87,11,0.12)]">
              <p className="eyebrow">What this covers</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {coverageAreas.map((area, index) => (
                  <div
                    key={area.title}
                    className="rounded-[1.35rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.76)] p-4"
                  >
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--asu-maroon)]/72">
                      0{index + 1}
                    </p>
                    <h3 className="mt-3 font-[family-name:var(--font-display)] text-[1.18rem] leading-tight text-[#191919]">
                      {area.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-ink)]">
                      {area.detail}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--ink)]/72">
                The narrative route stays focused on first-week friction points that often look
                minor from the outside but feel huge when it is your first time.
              </p>
            </article>

            <article className="maroon-panel flex flex-col justify-between gap-6">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-white/72">
                  Faculty side
                </p>
                <h2 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.02] text-white">
                  Early support signals, not surveillance.
                </h2>
                <p className="mt-4 text-base leading-7 text-white/82">
                  The faculty dashboard shows who may still be unsure about advising, office hours,
                  or class navigation, plus warmer personalized check-ins that match the actual
                  barrier.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-xs text-sm leading-6 text-white/72">
                  Built for earlier, more human outreach instead of generic escalation.
                </p>
                <Link href="/dashboard" className="button-gold">
                  Open faculty console
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Link
            href={featuredCard.href}
            className="group relative overflow-hidden rounded-[2.2rem] border border-[rgba(140,29,64,0.12)] bg-[linear-gradient(145deg,rgba(255,248,232,0.96),rgba(255,255,255,0.94)_42%,rgba(246,238,232,0.96)_100%)] p-8 shadow-[0_26px_70px_rgba(43,25,17,0.1)] transition duration-200 hover:-translate-y-1"
          >
            <div className="absolute right-6 top-6 font-[family-name:var(--font-display)] text-[4.6rem] leading-none text-[rgba(140,29,64,0.1)] sm:text-[5.8rem]">
              01
            </div>

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div>
                <p className="eyebrow">Start here</p>
                <p className="mt-3 text-[0.76rem] font-semibold uppercase tracking-[0.28em] text-[var(--asu-maroon)]/72">
                  {featuredCard.eyebrow}
                </p>
                <h2 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[0.98] text-[#191919] sm:text-[3.4rem]">
                  Find support without decoding ASU first.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--ink)]/80">
                  {featuredCard.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {featuredCard.tags.map((tag) => (
                  <div
                    key={tag}
                    className="rounded-[1.25rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.72)] px-4 py-4 text-sm font-medium text-[var(--ink)]/78"
                  >
                    {tag}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(140,29,64,0.12)] pt-6">
                <div>
                  <span className="inline-flex rounded-full bg-[var(--asu-maroon)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(140,29,64,0.18)] transition group-hover:bg-[var(--asu-maroon-deep)]">
                    {featuredCard.label}
                  </span>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted-ink)]">
                    {featuredCard.featuredNote}
                  </p>
                </div>
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[var(--asu-maroon)]/68">
                  Best entry point for new students
                </p>
              </div>
            </div>
          </Link>

          <div className="overflow-hidden rounded-[2.2rem] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.94)] shadow-[0_22px_60px_rgba(0,0,0,0.08)]">
            <div className="border-b border-[rgba(0,0,0,0.08)] px-6 py-6 sm:px-7">
              <p className="eyebrow">Other ways in</p>
              <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-[#191919]">
                Pick the route that matches the question in front of you.
              </h2>
            </div>

            <div className="divide-y divide-[rgba(0,0,0,0.07)]">
              {secondaryCards.map((card, index) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group grid gap-4 px-6 py-5 transition hover:bg-[rgba(255,198,39,0.08)] md:grid-cols-[auto_1fr_auto] md:items-start sm:px-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(140,29,64,0.12)] bg-[rgba(140,29,64,0.04)] text-sm font-semibold text-[var(--asu-maroon)]">
                    0{index + 2}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[var(--asu-maroon)]/78">
                      {card.eyebrow}
                    </p>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-[1.65rem] leading-tight text-[#191919]">
                      {card.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-[0.98rem] leading-7 text-[var(--ink)]/78">
                      {card.description}
                    </p>
                    {card.detail ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">{card.detail}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center md:justify-end">
                    <span className="inline-flex rounded-full border border-[rgba(140,29,64,0.14)] px-4 py-2 text-sm font-semibold text-[var(--asu-maroon)] transition group-hover:border-[rgba(140,29,64,0.28)] group-hover:bg-white">
                      {card.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
