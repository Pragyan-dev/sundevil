"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/finder", label: "Find Resources" },
  { href: "/simulate", label: "First-Week Story" },
  { href: "/scholarships", label: "Scholarships" },
];

const utilityLinks = [
  { href: "https://www.asu.edu/", label: "ASU Home", external: true },
  { href: "/myasu", label: "My ASU", external: false },
  {
    href: "https://www.asu.edu/academics/colleges-schools",
    label: "Colleges and Schools",
    external: true,
  },
  { href: "https://weblogin.asu.edu/cas/login", label: "Sign In", external: true },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(0,0,0,0.08)] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
      <div className="h-2 bg-[#2f2f2f]" />

      <div className="border-b border-[rgba(0,0,0,0.08)] bg-[#e9e7e4]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-6 overflow-x-auto px-4 py-2 text-[0.82rem] text-[#3f3f3f] sm:px-6 lg:px-8">
          {utilityLinks.map((link) => (
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap transition hover:text-[var(--asu-maroon)]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap transition hover:text-[var(--asu-maroon)]"
              >
                {link.label}
              </Link>
            )
          ))}
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-5">
            <Image
              src="/asu/arizona-state-university-logo.png"
              alt="Arizona State University logo"
              width={400}
              height={72}
              priority
              className="h-auto w-[250px] min-w-[250px] sm:w-[320px] sm:min-w-[320px]"
            />

            <div className="hidden border-l border-[rgba(0,0,0,0.12)] pl-5 lg:block">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#747474]">
                First-gen student support demo
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-[1.75rem] font-semibold leading-none text-[#191919]">
                SunDevilConnect
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="hidden rounded-full border border-[rgba(0,0,0,0.12)] bg-white px-4 py-2 text-sm font-medium text-[#191919] transition hover:border-[var(--asu-gold)] hover:bg-[rgba(255,198,39,0.12)] md:inline-flex"
          >
            Faculty Dashboard
          </Link>
        </div>
      </div>

      <div className="border-t border-[rgba(0,0,0,0.08)] bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-[5px] px-4 py-4 text-[0.97rem] font-medium transition ${
                isActive(pathname, link.href)
                  ? "border-[var(--asu-gold)] text-[#191919]"
                  : "border-transparent text-[#2f2f2f] hover:border-[rgba(255,198,39,0.65)] hover:bg-[rgba(0,0,0,0.02)]"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/dashboard"
            className="ml-auto inline-flex whitespace-nowrap rounded-full border border-[rgba(0,0,0,0.12)] px-4 py-2 text-sm font-medium text-[#191919] transition hover:border-[var(--asu-gold)] hover:bg-[rgba(255,198,39,0.12)] md:hidden"
          >
            Faculty Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
