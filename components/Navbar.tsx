"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { href: "/finder", label: "Find Resources" },
  { href: "/simulate", label: "Simulations" },
  { href: "/chat", label: "Chat" },
  { href: "/scholarships", label: "Scholarships" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(140,29,64,0.12)] bg-[rgba(255,251,245,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,198,39,0.5)] bg-[var(--asu-maroon)] text-sm font-semibold tracking-[0.24em] text-[var(--warm-white)]">
            ASU
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg leading-none text-[var(--asu-maroon)]">
              SunDevilConnect
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[var(--muted-ink)]">
              Resource confidence for first-gen students
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                isActive(pathname, link.href)
                  ? "bg-[var(--asu-maroon)] text-[var(--warm-white)] shadow-[0_12px_30px_rgba(140,29,64,0.18)]"
                  : "text-[var(--ink)] hover:bg-[rgba(140,29,64,0.06)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/dashboard"
          className="rounded-full border border-[rgba(140,29,64,0.16)] px-4 py-2 text-sm text-[var(--asu-maroon)] transition hover:border-[var(--asu-gold)] hover:bg-[rgba(255,198,39,0.14)]"
        >
          Faculty Dashboard
        </Link>
      </div>
    </header>
  );
}
