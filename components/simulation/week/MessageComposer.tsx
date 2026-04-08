"use client";

interface MessageComposerProps {
  facultyName: string;
  templates: string[];
  draft: string;
  sent: boolean;
  onChange: (value: string) => void;
  onUseTemplate: (template: string) => void;
  onSend: () => void;
}

export function MessageComposer({
  facultyName,
  templates,
  draft,
  sent,
  onChange,
  onUseTemplate,
  onSend,
}: MessageComposerProps) {
  return (
    <div className="rounded-[1.8rem] border border-[#f0dbc6] bg-[#fff8ef] p-4 shadow-[0_16px_44px_rgba(44,17,22,0.08)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
            Message Professor
          </p>
          <h3 className="mt-2 font-[var(--font-sim-display)] text-[1.65rem] leading-none text-[#2c1116]">
            Email {facultyName}
          </h3>
        </div>
        {sent ? (
          <span className="rounded-full bg-[#16a34a] px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.14em] text-white">
            Sent
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-7 text-[#6f4a4e]">
        Keep it short, kind, and specific. The goal is not sounding perfect. The goal is making it easy for the professor to say yes.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template}
            type="button"
            onClick={() => onUseTemplate(template)}
            className="rounded-full border border-[#e8c9a3] bg-white px-3 py-2 text-xs font-black text-[#8c1d40] transition hover:-translate-y-0.5"
          >
            Use template
          </button>
        ))}
      </div>

      <textarea
        value={draft}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Hi ${facultyName}, I am in your class...`}
        className="mt-4 min-h-44 w-full rounded-[1.4rem] border border-[#ecd7c0] bg-white px-4 py-4 text-sm leading-7 text-[#2c1116] outline-none transition focus:border-[#8c1d40]"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSend}
          disabled={sent || draft.trim().length < 35}
          className="rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[#731736] disabled:cursor-not-allowed disabled:bg-[#c5b2b5]"
        >
          {sent ? "Message sent" : "Send message"}
        </button>
        <p className="text-sm leading-6 text-[#6f4a4e]">
          Suggested sweet spot: 3 to 5 sentences and one clear ask.
        </p>
      </div>
    </div>
  );
}
