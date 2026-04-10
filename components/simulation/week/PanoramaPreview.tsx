"use client";

import { useRef, useState } from "react";

interface PanoramaPreviewProps {
  title: string;
  location: string;
  videoSrc: string;
  viewed: boolean;
  onViewed: () => void;
}

export function PanoramaPreview({
  title,
  location,
  videoSrc,
  viewed,
  onViewed,
}: PanoramaPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (!viewed) {
      onViewed();
    }

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
    setIsPlaying(false);
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

      <button
        type="button"
        onClick={togglePlayback}
        aria-pressed={isPlaying}
        className="group mt-4 block overflow-hidden rounded-[1.4rem] border border-[#e4c7a4] bg-[#2c1116] text-left shadow-[0_16px_36px_rgba(44,17,22,0.18)] transition hover:-translate-y-0.5"
      >
        <div className="relative">
          <video
            ref={videoRef}
            className="aspect-video w-full bg-[#2c1116] object-cover"
            playsInline
            muted
            loop
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-4">
            <span className="rounded-full bg-[rgba(44,17,22,0.46)] px-3 py-1 text-xs font-bold text-white">
              tap to {isPlaying ? "pause" : "play"}
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold text-white">
                room
              </span>
              <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold text-white">
                seats
              </span>
              <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold text-white">
                front
              </span>
            </div>
          </div>
        </div>
      </button>

      <p className="mt-3 text-sm leading-6 text-[#6f4a4e]">
        The goal is helping the room feel familiar before you walk in, so math, chem, and Python
        feel less abstract on day one.
      </p>
    </div>
  );
}
