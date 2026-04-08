"use client";

import { useRef, useState } from "react";

interface PanoramaPreviewProps {
  title: string;
  location: string;
  viewed: boolean;
  onViewed: () => void;
}

export function PanoramaPreview({
  title,
  location,
  viewed,
  onViewed,
}: PanoramaPreviewProps) {
  const [offset, setOffset] = useState(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);

  function beginDrag(clientX: number) {
    draggingRef.current = true;
    lastXRef.current = clientX;
    if (!viewed) {
      onViewed();
    }
  }

  function moveDrag(clientX: number) {
    if (!draggingRef.current) {
      return;
    }

    const delta = clientX - lastXRef.current;
    lastXRef.current = clientX;
    setOffset((current) => Math.max(-50, Math.min(50, current + delta * 0.25)));
  }

  function endDrag() {
    draggingRef.current = false;
  }

  return (
    <div className="flex h-full flex-col rounded-[1.6rem] border border-[#ecd7c0] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
            360 preview
          </p>
          <p className="mt-1 font-[var(--font-sim-display)] text-[1.1rem] leading-none text-[#2c1116]">
            {title}
          </p>
        </div>
        <span className="rounded-full bg-[#fff5df] px-3 py-1 text-xs font-bold text-[#7a5358]">
          {location}
        </span>
      </div>

      <div
        className="mt-4 overflow-hidden rounded-[1.4rem] border border-[#e4c7a4] bg-[#2c1116]"
        onMouseDown={(event) => beginDrag(event.clientX)}
        onMouseMove={(event) => moveDrag(event.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={(event) => beginDrag(event.touches[0]?.clientX ?? 0)}
        onTouchMove={(event) => moveDrag(event.touches[0]?.clientX ?? 0)}
        onTouchEnd={endDrag}
        role="presentation"
      >
        <div
          className="h-48 w-full transition-transform duration-150 sm:h-56"
          style={{
            background: `linear-gradient(90deg,#3d1b22 ${18 + offset * 0.2}%,#7c3e3b ${
              42 + offset * 0.15
            }%,#d7815d 62%,#f6d8a6 82%)`,
            transform: `translateX(${offset * 0.3}px)`,
          }}
        >
          <div className="flex h-full w-full items-end justify-between px-4 pb-4">
            <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
              drag to look around
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold text-white">
                seats
              </span>
              <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold text-white">
                board
              </span>
              <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold text-white">
                exit
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#6f4a4e]">
        The goal is not realism-perfect graphics. It is helping the room feel familiar before you
        walk in.
      </p>
    </div>
  );
}
