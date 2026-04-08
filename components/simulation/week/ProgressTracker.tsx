"use client";

interface ProgressTrackerProps {
  completedDays: number;
  totalDays: number;
  points: number;
  badges: number;
}

export function ProgressTracker({
  completedDays,
  totalDays,
  points,
  badges,
}: ProgressTrackerProps) {
  const value = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <div className="rounded-[2rem] border border-white/16 bg-white/10 p-4 text-white shadow-[0_24px_80px_rgba(44,17,22,0.18)] backdrop-blur-md sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-black uppercase tracking-[0.22em] text-[#ffe2ae]">
            Week Progress
          </p>
          <p className="mt-2 font-[var(--font-sim-display)] text-[1.5rem] leading-none">
            {completedDays}/{totalDays} days cleared
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-white/12 px-3 py-2 font-bold text-white">
            🔱 {points} points
          </span>
          <span className="rounded-full bg-white/12 px-3 py-2 font-bold text-white">
            🏅 {badges} badges
          </span>
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/12">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#ffc627,#ffdb86)] transition-[width] duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
