import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell pb-24">
      <div className="mx-auto max-w-3xl">
        <div className="paper-card text-center">
          <p className="eyebrow">Not found</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl text-[var(--asu-maroon)]">
            This page wandered off.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[var(--ink)]/82">
            Try the resource finder, the simulation hub, or go back to the landing page.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="button-primary">
              Home
            </Link>
            <Link href="/finder" className="button-secondary">
              Find Resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
