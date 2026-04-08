"use client";

interface ProgressBarProps {
  value: number;
  current: number;
  total: number;
  label: string;
}

export function ProgressBar({ value, current, total, label }: ProgressBarProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-black uppercase tracking-[0.16em] text-[#ffe2ae]">{label}</span>
        <span className="font-bold text-white">
          {current}/{total}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/14">
        <span
          className="block h-full rounded-full bg-[linear-gradient(90deg,#ffc627,#ffd877,#fff3cb)] transition-[width] duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
