import Link from "next/link";

interface CardLink {
  href: string;
  label: string;
  external?: boolean;
}

interface ResourceCardProps {
  eyebrow?: string;
  title: string;
  description: string;
  detail?: string;
  meta?: string[];
  links?: CardLink[];
  featured?: boolean;
  className?: string;
}

function renderLink(link: CardLink, index: number) {
  const isPrimary = index === 0;
  const classes = isPrimary ? "button-primary" : "button-secondary";

  if (link.external) {
    return (
      <a
        key={`${link.href}-${link.label}`}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link key={`${link.href}-${link.label}`} href={link.href} className={classes}>
      {link.label}
    </Link>
  );
}

export function ResourceCard({
  eyebrow,
  title,
  description,
  detail,
  meta,
  links,
  featured = false,
  className,
}: ResourceCardProps) {
  return (
    <article
      className={`paper-card flex h-full flex-col gap-5 ${featured ? "paper-card-featured" : ""} ${
        className ?? ""
      }`}
    >
      <div className="space-y-3">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--asu-maroon)]">
          {title}
        </h3>
        <p className="text-base leading-7 text-[var(--ink)]/85">{description}</p>
        {detail ? <p className="text-sm leading-6 text-[var(--muted-ink)]">{detail}</p> : null}
      </div>

      {meta?.length ? (
        <div className="flex flex-wrap gap-2">
          {meta.map((item) => (
            <span key={item} className="pill">
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {links?.length ? <div className="mt-auto flex flex-wrap gap-3">{links.map(renderLink)}</div> : null}
    </article>
  );
}
