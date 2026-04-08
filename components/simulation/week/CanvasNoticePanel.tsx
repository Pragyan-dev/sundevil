"use client";

interface CanvasNoticePanelProps {
  label: string;
  noticeText: string;
  read: boolean;
  onRead: () => void;
}

export function CanvasNoticePanel({
  label,
  noticeText,
  read,
  onRead,
}: CanvasNoticePanelProps) {
  return (
    <div className="flex h-full flex-col rounded-[1.6rem] border border-[#ecd7c0] bg-[#fffdfa] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
            Canvas
          </p>
          <p className="mt-1 font-[var(--font-sim-display)] text-[1.05rem] leading-none text-[#2c1116]">
            {label}
          </p>
        </div>
        {read ? (
          <span className="rounded-full bg-[#16a34a] px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.14em] text-white">
            Read
          </span>
        ) : (
          <button
            type="button"
            onClick={onRead}
            className="rounded-full bg-[#8c1d40] px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
          >
            Open notice
          </button>
        )}
      </div>

      <div className="mt-4 flex-1 rounded-[1.2rem] border border-[#f1deca] bg-[#fff8ef] px-4 py-4">
        <p className="text-sm leading-7 text-[#6f4a4e]">{noticeText}</p>
      </div>
    </div>
  );
}
