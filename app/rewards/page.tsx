import Link from "next/link";

export default function RewardsPage() {
  return (
    <div className="page-shell pb-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.7fr_1.3fr]">
        <section className="maroon-panel">
          <p className="eyebrow text-[var(--asu-gold)]">Next up</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight text-[var(--warm-white)]">
            NFT rewards are on the way.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[rgba(255,251,245,0.82)]">
            This placeholder keeps the new rewards icon live today while we wire up the full
            collectible and redemption experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/simulate" className="button-primary">
              Return to First-Week Story
            </Link>
            <Link href="/dashboard/faculty" className="button-secondary">
              Open Faculty Dashboard
            </Link>
          </div>
        </section>

        <section className="paper-card space-y-6">
          <div>
            <p className="eyebrow">Planned experience</p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--asu-maroon)]">
              A single place for badges, collectibles, and unlocks.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-[1.5rem] border border-[rgba(140,29,64,0.12)] bg-[rgba(255,255,255,0.76)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--asu-maroon)]">
                Badge shelf
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
                Keep earned story badges and future NFT collectibles in one profile-aware view.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-[rgba(140,29,64,0.12)] bg-[rgba(255,255,255,0.76)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--asu-maroon)]">
                Claim flows
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
                Connect reward milestones to claim instructions, wallet steps, and future drops.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-[rgba(140,29,64,0.12)] bg-[rgba(255,255,255,0.76)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--asu-maroon)]">
                Progress links
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
                Tie rewards back to the first-week story, MyASU support tasks, and later campus wins.
              </p>
            </article>
          </div>

          <div className="rounded-[1.6rem] border border-dashed border-[rgba(255,198,39,0.9)] bg-[rgba(255,198,39,0.12)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--asu-maroon)]">
              Current status
            </p>
            <p className="mt-3 text-base leading-7 text-[var(--ink)]">
              Navigation is live now. The NFT rewards experience itself is intentionally marked as
              coming soon until the collection model and redemption flow are implemented.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
