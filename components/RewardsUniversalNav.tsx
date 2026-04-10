import Link from "next/link";

const DEFAULT_REWARDS_USER_NAME = "Chirag";
const DEFAULT_SIGN_OUT_URL = "https://webapp4.asu.edu/myasu/Signout";

type RewardsUniversalNavProps = {
  userName?: string;
  signOutUrl?: string;
};

function normalizeUserName(userName?: string) {
  const trimmed = userName?.trim();
  return trimmed ? trimmed : DEFAULT_REWARDS_USER_NAME;
}

function normalizeSignOutUrl(signOutUrl?: string) {
  const trimmed = signOutUrl?.trim();

  if (!trimmed) {
    return DEFAULT_SIGN_OUT_URL;
  }

  try {
    const parsedUrl = new URL(trimmed);

    if (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:") {
      return parsedUrl.toString();
    }
  } catch {}

  return DEFAULT_SIGN_OUT_URL;
}

export function RewardsUniversalNav({
  userName,
  signOutUrl,
}: Readonly<RewardsUniversalNavProps>) {
  const resolvedUserName = normalizeUserName(userName);
  const resolvedSignOutUrl = normalizeSignOutUrl(signOutUrl);
  const linkClassName =
    "whitespace-nowrap text-[14px] leading-none text-[#2d2d2d] no-underline transition-colors hover:text-[#2d2d2d]";

  return (
    <header className="border-b border-[#d0d0d0] bg-[#e8e8e8] font-[Arial,sans-serif]">
      <div className="mx-auto flex h-7 w-full max-w-[1280px] items-center px-8">
        <nav className="ml-auto flex items-center gap-[26px] overflow-x-auto whitespace-nowrap">
        <a
          href="https://www.asu.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          ASU Home
        </a>
        <a
          href="https://my.asu.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          My ASU
        </a>
        <a
          href="https://www.asu.edu/academics/colleges-schools"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          Colleges and Schools
        </a>
        <Link
          href="/dashboard/faculty"
          className={linkClassName}
        >
          Faculty Dashboard
        </Link>
        <div className="whitespace-nowrap text-[14px] leading-none text-[#2d2d2d]">
          <span className="font-bold text-[#2d2d2d]">{resolvedUserName}</span>{" "}
          <a
            href={resolvedSignOutUrl}
            className="text-[#2d2d2d] no-underline transition-colors hover:text-[#2d2d2d]"
          >
            (Sign Out)
          </a>
        </div>
        </nav>
      </div>
    </header>
  );
}
