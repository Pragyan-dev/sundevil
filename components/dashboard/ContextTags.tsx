interface ContextTagsProps {
  tags: string[];
}

export function ContextTags({ tags }: ContextTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-[rgba(140,29,64,0.12)] bg-[rgba(255,255,255,0.78)] px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--asu-maroon)]"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
